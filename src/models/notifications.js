import {model, Schema, SchemaTypes} from 'mongoose';

const NotificationSchema = new Schema({
  from: {
    type: SchemaTypes.ObjectId,
    ref: 'User',
  },
  to: {
    type: SchemaTypes.ObjectId,
    ref: 'User',
  },
  title: String,
  body: String,

  isRead: {type: Boolean, default: false},

  createdAt: {type: Date, default: Date.now},
});

export const Notification = model('Notification', NotificationSchema);
