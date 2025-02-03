import {model, Schema, SchemaTypes} from 'mongoose';

const ChatSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  user: {
    _id: {
      type: SchemaTypes.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
    },
    avatar: {
      type: String,
    },
  },
  sent: {
    type: Boolean,
    default: false,
  },
  received: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Chat = model('Chat', ChatSchema);
