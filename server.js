import {createServer} from 'http';
import {initializeApp} from './initialize-app.js';
import initializeSocket from './src/utils/events/chat-socket.js';

const app = initializeApp();
const server = createServer(app);
//const io = new Server(server);
const io = initializeSocket(server);
//const userSockets = {};

// io.on('connection', socket => {
//   console.log('User connected:', socket.id);

//   socket.on('sendMessage', messageData => {
//     console.log('Received message:', messageData);

//     // Send message to all clients
//     // io.emit('newMessage', messageData);

//     socket.on('sendMessage', messageData => {
//       const {_id, message} = messageData;
//       const recipientSocketId = userSockets[_id];

//       if (recipientSocketId) {
//         io.to(recipientSocketId).emit('newMessage', message);
//       } else {
//         console.log('Recipient not connected');
//       }
//     });
//   });

//   socket.on('disconnect', () => {
//     console.log('A user disconnected');
//   });

//   // 🌍 User sends their ID when they connect
//   socket.on('userConnected', (userId) => {
//     userSockets[userId] = socket.id; // Store user with their socket ID
//     console.log(`User ${userId} is online with socket ID ${socket.id}`);
//   });

// });

export {io, server};
