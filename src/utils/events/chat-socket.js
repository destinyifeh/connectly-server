import {Server} from 'socket.io';
import {sendPushNotification} from '../../configs/push-notification.config.js';
import {Chat} from '../../models/chats.js';
import {User} from '../../models/users.js';
import {capitalizeFirstLetter} from '../helpers.js';
const userSockets = {}; // Store user socket connections

const initializeSocket = server => {
  const io = new Server(server, {
    cors: {
      origin: '*', // Adjust this based on your security requirements
      methods: ['GET', 'POST'],
    },
  });

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const userId = socket.handshake.auth.userId;

      // Validate the userId
      if (!userId || typeof userId !== 'string') {
        return next(new Error('Invalid user ID'));
      }

      // Verify user existence in the database
      const user = await User.findById(userId);
      if (!user) {
        return next(new Error('User not found'));
      }

      // Attach user information to the socket object
      socket.userId = userId;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async socket => {
    console.log('User connected:', socket.id);
    const userId = socket.userId;
    userSockets[userId] = socket.id;
    console.log(`User ${userId} is online with socket ID ${socket.id}`);
    // Notify the frontend that this user is online
    io.emit('userStatus', {userId, isOnline: true});
    try {
      await User.findByIdAndUpdate(userId, {isOnline: true});
    } catch (err) {
      console.log(err, 'updating online status err');
    }

    socket.on('sendMessage', async messageData => {
      console.log('Received message:', messageData);

      try {
        const savedMessage = await Chat.create({
          ...messageData,
          _id: undefined,
          sent: true,
          pending: false,
        });
        console.log(savedMessage, 'saved db');
        console.log(`Emitting messageSaved to ${socket.id}`, savedMessage);
        socket.emit('messageSaved', savedMessage);
        const receiverSocketId = userSockets[messageData.receiverId];

        if (receiverSocketId) {
          console.log(
            `Message sent to user ${messageData.receiverId} at socket ${receiverSocketId}`,
          );
          io.to(receiverSocketId).emit('newMessage', savedMessage);
          console.log(`Message sent to user ${messageData.receiverId}`);
          sendPushNotification(
            messageData,
            capitalizeFirstLetter(messageData.user.name),
            messageData.text,
          );
        } else {
          console.log(
            `User ${messageData.receiverId} is offline. Message saved.`,
          );
          sendPushNotification(
            messageData,
            capitalizeFirstLetter(messageData.user.name),
            messageData.text,
          );
        }
      } catch (err) {
        console.log(err);
      }
    });

    socket.on('typing', ({senderId, receiverId, isTyping}) => {
      console.log('istyping,,,');
      const receiverSocketId = userSockets[receiverId];
      if (receiverSocketId) {
        console.log('istyping22,,,', receiverSocketId);
        // Emit a "typing" event to the receiver only
        io.to(receiverSocketId).emit('typing', {senderId, isTyping});
        console.log(
          `User ${senderId} is ${
            isTyping ? 'typing...' : 'not typing'
          } (sent to ${receiverId})`,
        );
      }
    });

    socket.on('messageReceived', async ({messageId, receiverId, senderId}) => {
      try {
        // Update the message in your database to mark it as received
        await Chat.findByIdAndUpdate(messageId, {
          received: true,
          //readAt: new Date(), // Optionally store the timestamp
        });
        console.log(`Message ${messageId} marked as received by ${receiverId}`);

        // Optionally, notify the sender that their message was read
        // Assuming you have the sender's socket ID stored in userSockets:
        io.to(userSockets[senderId]).emit('messageReceivedStatus', {
          messageId,
          received: true,
        });
      } catch (error) {
        console.error('Error updating message status:', error);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`User ${socket.userId} disconnected`);
      io.emit('userStatus', {userId: socket.userId, isOnline: false});
      delete userSockets[socket.userId];
      try {
        await User.findByIdAndUpdate(socket.userId, {isOnline: false});
      } catch (err) {
        console.error('Error updating online status:', err);
      }
    });
  });

  return io;
};

export default initializeSocket;
