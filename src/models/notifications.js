import {model, Schema, SchemaTypes} from 'mongoose';
import {DOCUMENT_EXPIRATION_PERIOD} from '../utils/constants.js';

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

NotificationSchema.index(
  {createdAt: 1},
  {expireAfterSeconds: DOCUMENT_EXPIRATION_PERIOD},
);

export const Notification = model('Notification', NotificationSchema);
