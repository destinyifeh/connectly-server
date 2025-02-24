import mongoose from 'mongoose';
import {User} from '../models/users.js';
import {NOTIFICATION_SENDER_URL} from '../utils/constants.js';

export const sendPushNotification = async (
  userId,
  title,
  body,
  extraData = {},
) => {
  const objectId = new mongoose.Types.ObjectId(String(userId));
  try {
    console.log(userId, 'userid');
    const user = await User.findById(objectId);
    console.log(user, 'user me');
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
        url: '/dashboard/user-notification',
        ...extraData,
      },
    }));

    console.log(message, 'my message');

    // const message = {
    //   to: user.pushToken, // The recipient's Expo push token (retrieved and stored from the client)
    //   sound: 'default',
    //   title: 'Your Notification Title',
    //   body: 'This is the content of your notification.',
    //   data: {
    //     extraData: 'Some extra data',

    //     url: '/dashboard/notification',
    //   },
    // };

    const response = await fetch(NOTIFICATION_SENDER_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    const data = await response.json();
    console.log('Push notification response:', data);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};
