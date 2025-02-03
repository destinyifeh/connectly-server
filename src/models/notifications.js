import {model, Schema, SchemaTypes} from 'mongoose';

const NotificationSchema = new Schema({
  sender: {
    type: SchemaTypes.ObjectId,
    ref: 'User',
  },
  receiver: {
    type: SchemaTypes.ObjectId,
    ref: 'User',
  },
  title: String,
  body: String,

  isRead: {type: Boolean, default: false},
  seen: {type: Boolean, default: false},

  createdAt: {type: Date, default: Date.now},
});

export const Notification = model('Notification', NotificationSchema);
