import {model, Schema} from 'mongoose';
import {DOCUMENT_EXPIRATION_PERIOD} from '../utils/constants.js';

const ChatSchema = new Schema({
  text: {
    type: String,
    required: false,
  },
  // _id: String,
  senderId: {type: Schema.Types.ObjectId, ref: 'User'},
  receiverId: {type: Schema.Types.ObjectId, ref: 'User'},
  //receiverId: {type: String, required: true},
  //senderId: {type: String, required: true},
  image: {
    type: String,
    required: false,
  },
  user: {
    _id: {type: String, required: true},
    name: {type: String, required: true},
  },

  avatar: {
    type: String,
  },
  sent: {
    type: Boolean,
    default: false,
  },
  pending: {
    type: Boolean,
    default: false,
  },
  received: {
    type: Boolean,
    default: false,
  },
  isViewed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ChatSchema.index(
  {createdAt: 1},
  {expireAfterSeconds: DOCUMENT_EXPIRATION_PERIOD},
);

export const Chat = model('Chat', ChatSchema);
