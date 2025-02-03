import mongoose from 'mongoose';
import {mongoURI} from '../utils/constants.js';

export const initializeDB = () => {
  mongoose.Promise = global.Promise;
  mongoose
    .connect(mongoURI)
    .then(() => console.log(`DB connected on ${mongoURI}`))
    .catch(err => console.log(err.message, 'DB error'));
};
