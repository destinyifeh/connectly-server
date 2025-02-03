import {io} from '../../../server.js';

// Listen for incoming connections
io.on('connection', socket => {
  console.log('a user connected yes o');

  // Listen for "message" event from the client
  socket.on('sendMessage', messageData => {
    console.log('Received message data:', messageData);

    // Create a new chat message based on received data
    //   const newMessage = new Chat({
    //     text: messageData.text,
    //     image: messageData.image,
    //     user: messageData.user,
    //     sent: true,
    //     received: false,
    //     createdAt: new Date(),
    //   });

    // Save to the database and emit to all clients
    //   newMessage.save().then((savedMessage) => {
    //     io.emit('newMessage', savedMessage); // Emit event with saved message to all clients
    //   });

    const payload = {
      text,
      image,
      user: {
        _id: userId,
        name: username,
        avatar: profilePhotoUrl,
      },
      sent: true,
      received: false,
      createdAt: new Date(),
    };

    io.emit('newMessage', payload);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('user disconnected yesoo');
  });
});
