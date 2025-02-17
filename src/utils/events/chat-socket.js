import {Server} from 'socket.io';
import {Chat} from '../../models/chats.js';
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

    socket.on('userConnected', userId => {
      userSockets[userId] = socket.id;
      console.log(`User ${userId} is online with socket ID ${socket.id}`);
      // Notify the frontend that this user is online
      io.emit('userStatus', {userId, isOnline: true});
    });

    socket.on('sendMessage', async messageData => {
      console.log('Received message:', messageData);

      try {
        // const savedMessage = await Chat.create(messageData);
        const savedMessage = await Chat.create({
          ...messageData,
          _id: undefined,
        });
        console.log(savedMessage, 'saved db');
        const receiverSocketId = userSockets[messageData.receiverId];

        if (receiverSocketId) {
          console.log(
            `Message sent to user ${messageData.receiverId} at socket ${receiverSocketId}`,
          );
          io.to(receiverSocketId).emit('newMessage', savedMessage);
          console.log(`Message sent to user ${messageData.receiverId}`);
        } else {
          console.log(
            `User ${messageData.receiverId} is offline. Message saved.`,
          );
        }
      } catch (err) {
        console.log(err);
      }
    });

    socket.on('disconnect', () => {
      for (let userId in userSockets) {
        if (userSockets[userId] === socket.id) {
          console.log(`User ${userId} disconnected`);
          // Notify all clients that the user is offline
          io.emit('userStatus', {userId, isOnline: false});

          delete userSockets[userId];
          break;
        }
      }
    });
  });

  return io;
};

export default initializeSocket;
