import {Server} from 'socket.io';
import {sendPushNotification} from '../../configs/push-notification.config.js';
import {Chat} from '../../models/chats.js';
import {User} from '../../models/users.js';
const userSockets = {}; // Store user socket connections

const initializeSocket = server => {
  const io = new Server(server, {
    cors: {
      origin: '*', // Adjust this based on your security requirements
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', socket => {
    console.log('User connected:', socket.id);

    socket.on('userConnected', async userId => {
      userSockets[userId] = socket.id;
      console.log(`User ${userId} is online with socket ID ${socket.id}`);
      // Notify the frontend that this user is online
      io.emit('userStatus', {userId, isOnline: true});
      try {
        await User.findByIdAndUpdate(userId, {isOnline: true});
      } catch (err) {
        console.log(err, 'updating online status err');
      }
    });

    socket.on('sendMessage', async messageData => {
      console.log('Received message:', messageData);

      try {
        // const savedMessage = await Chat.create(messageData);
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
            messageData.receiverId,
            messageData.user.name,
            messageData.text,
          );
        } else {
          console.log(
            `User ${messageData.receiverId} is offline. Message saved.`,
          );
          sendPushNotification(
            messageData.receiverId,
            messageData.user.name,
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
      for (let userId in userSockets) {
        if (userSockets[userId] === socket.id) {
          console.log(`User ${userId} disconnected`);
          // Notify all clients that the user is offline
          io.emit('userStatus', {userId, isOnline: false});
          try {
            await User.findByIdAndUpdate(userId, {isOnline: false});
          } catch (err) {
            console.log(err, 'updating online status err');
          }

          delete userSockets[userId];
          break;
        }
      }
    });
  });

  return io;
};

export default initializeSocket;
