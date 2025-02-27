import {model, Schema, SchemaTypes} from 'mongoose';

const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: String,
  dob: String,
  age: String,
  phone: String,
  state: String,
  country: String,
  city: String,
  profilePhoto: {
    url: String,
    id: String,
  },
  isGoogleAuthUser: {
    type: Boolean,
    default: false,
  },
  otherPhotos: Array,
  favourites: Array,
  reports: Array,
  blackLists: Array,
  isOnline: {type: Boolean, default: false},
  isLike: {type: Boolean, default: false},
  gender: SchemaTypes.String,
  hobbies: SchemaTypes.Array,
  isActive: {type: Boolean, default: true},
  isAdmin: {type: Boolean, default: false},
  isSuperAdmin: {type: Boolean, default: false},
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  pushTokens: {type: [String], default: []},
  verifyToken: String,
  verifyTokenExpires: Date,
  createdAt: {type: Date, default: Date.now},
});

export const User = model('User', UserSchema);
