import mongoose from 'mongoose';
import {Notification} from '../models/notifications.js';

export const addNotification = async (req, res) => {
  try {
    const {body} = req;

    const notification = await Notification.create(body);
    res.status(200).json({
      code: '200',
      message: 'Notification sent',
      status: 'success',
      notification: notification,
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

export const getMyNotifications = async (req, res) => {
  try {
    const {
      params: {id},
    } = req;

    const to = new mongoose.Types.ObjectId(String(id));

    const notifications = await Notification.find({to: to})
      .sort({createdAt: -1})
      .populate('to')
      .populate('from');

    if (notifications.length > 0) {
      return res.status(200).json({
        notifications: notifications,
        mssage: 'Notifications fetched successfully',
        code: '200',
        status: 'success',
      });
    }
    return res.status(200).json({
      notifications: [],
      notificationMessage: 'No notification yet!',
      notificationCode: '404',
      status: 'success',
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err,
      status: 'error',
      code: '500',
      message: 'Internal server error',
    });
  }
};

export const updateViewedNotification = async (req, res) => {
  try {
    const {
      params: {id},
    } = req;

    const to = new mongoose.Types.ObjectId(String(id));
    const result = await Notification.updateMany(
      {to: to}, // Filter notifications by userId
      {$set: {isRead: true}}, // Set isRead to true
    );

    if (result.nModified === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No unread notifications found for this user.',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read.',
      data: result,
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

export const countMyUnreadNotifications = async (req, res) => {
  try {
    const {
      params: {id},
    } = req;

    const to = new mongoose.Types.ObjectId(String(id));

    const notifications = await Notification.find({to: to, isRead: false}).sort(
      {createdAt: -1},
    );

    if (notifications.length > 0) {
      return res.status(200).json({
        countNotifications: notifications,
        mssage: 'Notifications counted successfully',
        code: '200',
        status: 'success',
        notificationCount: notifications.length,
      });
    }
    return res.status(200).json({
      notificationMessage: 'No unread notification!',
      notificationCode: '404',
      status: 'success',
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err,
      status: 'error',
      code: '500',
      message: 'Internal server error',
    });
  }
};
