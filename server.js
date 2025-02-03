import {createServer} from 'http';
import {Server} from 'socket.io';
import {initializeApp} from './initialize-app.js';

const app = initializeApp();
const server = createServer(app);
const io = new Server(server);

io.on('connection', socket => {
  console.log('A user connected');

  socket.on('sendMessage', messageData => {
    console.log('Received message:', messageData);

    // Send message to all clients
    // io.emit('newMessage', messageData);

    socket.on('sendMessage', messageData => {
      const {_id, message} = messageData;
      const recipientSocketId = userSockets[_id];

      if (recipientSocketId) {
        io.to(recipientSocketId).emit('newMessage', message);
      } else {
        console.log('Recipient not connected');
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

export {io, server};
