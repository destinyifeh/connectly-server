import {Chat} from '../models/chats.js';

export const getChats = async (req, res) => {
  try {
    const {
      params: {id, receiverId},
      query: {query},
      user,
    } = req;
    console.log(id, 'sender id');
    console.log(receiverId, 'receiver id');
    const chats = await Chat.find({
      $or: [
        {senderId: id, receiverId: receiverId},
        {senderId: receiverId, receiverId: id},
      ],
    }).sort({createdAt: -1}); // Sort by time
    console.log(chats, 'chatsss');
    if (chats.length > 0) {
      return res.status(200).json({
        chats: chats,
        mssage: 'Chats fetched successfully',
        code: '200',
        status: 'success',
      });
    }
    return res.status(200).json({
      chats: [],
      userMessage: 'Chats Empty',
      userCode: '404',
      status: 'success',
    });
  } catch (error) {
    res.status(500).json({
      error: error,
      status: 'error',
      code: '500',
      message: 'Internal server error',
    });
  }
};
