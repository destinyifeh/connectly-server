import mongoose from 'mongoose';
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
    const senderObjectId = new mongoose.Types.ObjectId(String(id));
    const receiverObjectId = new mongoose.Types.ObjectId(String(receiverId));
    console.log(receiverObjectId, 'receiverobj id');
    console.log(senderObjectId, 'sender obj id');
    const chats = await Chat.find({
      $or: [
        {senderId: senderObjectId, receiverId: receiverObjectId},
        {senderId: receiverObjectId, receiverId: senderObjectId},
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
      chatMessage: 'Chats Empty',
      chatCode: '404',
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

export const getMyChats = async (req, res) => {
  try {
    const {
      params: {id},
      user,
    } = req;

    console.log(id, 'my idddd');
    const objectId = new mongoose.Types.ObjectId(String(id));
    console.log(objectId, 'my idddd22');
    // const chats = await Chat.find({
    //   $or: [{senderId: objectId}, {receiverId: objectId}],
    // })
    //   .sort({createdAt: -1})
    //   .populate('senderId', 'profilePhoto username')
    //   .populate('receiverId', 'profilePhoto username');
    const chats = await Chat.aggregate([
      {
        $lookup: {
          from: 'users', // collection name for User
          localField: 'senderId',
          foreignField: '_id',
          as: 'sender',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'receiverId',
          foreignField: '_id',
          as: 'receiver',
        },
      },
      {
        // Filter chats where the given user is either sender or receiver
        $match: {
          $or: [{senderId: objectId}, {receiverId: objectId}],
        },
      },
      {
        // Create a conversationId field that is the same regardless of the order of sender and receiver.
        $addFields: {
          conversationId: {
            $cond: {
              if: {$lt: ['$senderId', '$receiverId']},
              then: {
                $concat: [
                  {$toString: '$senderId'},
                  '_',
                  {$toString: '$receiverId'},
                ],
              },
              else: {
                $concat: [
                  {$toString: '$receiverId'},
                  '_',
                  {$toString: '$senderId'},
                ],
              },
            },
          },
        },
      },
      {
        // Sort messages so that the most recent comes first
        $sort: {createdAt: -1},
      },
      {
        // Group by conversationId and take the first (latest) chat from each group.
        $group: {
          _id: '$conversationId',
          latestChat: {$first: '$$ROOT'},
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {$eq: ['$received', false]},
                    {$eq: ['$receiverId', objectId]},
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },

      // Merge the unreadCount into the latestChat document
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$latestChat', {unreadCount: '$unreadCount'}],
          },
        },
      },

      //{
      // Replace the root with the latestChat document
      // $replaceRoot: {newRoot: '$latestChat'},
      //},
      {
        // Optionally, convert sender and receiver arrays to single objects if you expect only one match
        $unwind: '$sender',
      },
      {
        $unwind: '$receiver',
      },
    ]);

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
      chatMessage: 'Chats Empty',
      chatCode: '404',
      status: 'success',
    });
  } catch (err) {
    console.log(err, 'err');
    res.status(500).json({
      error: err,
      status: 'error',
      code: '500',
      message: 'Internal server error',
    });
  }
};

export const updateViewedChat = async (req, res) => {
  try {
    const {
      body: {chatId},
    } = req;
    console.log(chatId, 'idss');

    const chat = await Chat.findByIdAndUpdate(
      chatId,
      {
        isViewed: true,
        received: true,
      },
      {new: true},
    );
    console.log(chat, 'updated chat');
    return res.status(200).json({
      chats: chat,
      mssage: 'chat updated successfully',
      code: '200',
      status: 'success',
    });
  } catch (err) {
    console.log(err, 'err');
    res.status(500).json({
      error: err,
      status: 'error',
      code: '500',
      message: 'Internal server error',
    });
  }
};
