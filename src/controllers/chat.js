import {io} from '../../server.js';

export const sendMessageController = async (req, res) => {
  const {text, image, userId, name, profilePhotoUrl} = req.body;
  console.log(req.body, 'bodyyyy');
  const payload = {
    text,
    image,
    user: {
      _id: userId,
      name: name,
      avatar: profilePhotoUrl,
    },
    sent: true,
    received: false,
    createdAt: new Date(),
  };

  console.log(payload, 'pyerr');
  // const newMessage = new Chat({
  //     text,
  //     image,
  //     user: {
  //       _id: userId,
  //       name: username,
  //       avatar: profilePhotoUrl
  //     },
  //     sent: true,
  //     received: false,
  //     createdAt: new Date(),
  //   });

  try {
    // Save message to the database
    // const savedMessage = await newMessage.save();

    // Emit the new message to all clients
    //io.emit('newMessage', savedMessage); // 'newMessage' event to all clients
    // io.emit('newMessage', payload);
    io.to(userId).emit('newMessage', payload);
    console.log(payload, 'payyykkii');

    res.status(200).send('posted');
  } catch (err) {
    res.status(500).json({error: 'Error saving message'});
  }
};
