import mongoose from 'mongoose';
import {User} from '../models/users.js';
import {NOTIFICATION_SENDER_URL} from '../utils/constants.js';

export const sendPushNotification = async (
  data,
  title,
  body,
  extraData = {},
) => {
  const userId = data?.receiverId;
  const objectId = new mongoose.Types.ObjectId(String(userId));
  const senderObjectId = new mongoose.Types.ObjectId(String(data.senderId));
  try {
    console.log(userId, 'userid', senderObjectId);
    const user = await User.findById(objectId);
    const theSender = await User.findById(senderObjectId);
    console.log(user, 'user me');
    console.log(theSender, 'user sender');
    if (!user || !user.pushTokens || user.pushTokens.length === 0) {
      console.log('No push tokens found for user');
      return;
    }
    // Prepare a message for each token
    const message = user.pushTokens.map(token => ({
      to: token,
      sound: 'default',
      title,
      body,
      data: {
        url: '/dashboard/chat',
        sender: {
          name: data.user.name,
          _id: data.user._id,
          senderId: data?.senderId,
          info: {
            profilePhoto: theSender.profilePhoto,
            isOnline: theSender.isOnline,
            _id: theSender._id,
            dob: theSender.dob,
            username: theSender.username,
            isFromMychats: true,
            senderId: theSender._id,
            receiverId: user._id,
          },
        },
        receiver: {
          receiverId: userId,
          name: user.username,
        },
        ...extraData,
      },
      categoryId: 'message',
    }));

    console.log(message, 'my message');

    const response = await fetch(NOTIFICATION_SENDER_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    const res = await response.json();
    console.log('Push notification response:', res);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};
