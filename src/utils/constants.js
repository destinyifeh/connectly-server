import dotenv from 'dotenv';
dotenv.config();

const env = process.env.NODE_ENV || 'development';
export const mongoURI =
  env === 'production' ? process.env.MONGO_URI_PROD : process.env.MONGO_URI_DEV;

export const dev_env = env === 'development';
export const prod_env = env === 'production';

export const SERVER_BASE_URL = dev_env
  ? 'http://localhost:4000'
  : 'https://connectly-server-kqcj.onrender.com';

export const NOTIFICATION_SENDER_URL =
  'https://api.expo.dev/v2/push/send?useFcmV1=true';

export const DOCUMENT_EXPIRATION_PERIOD = 15 * 24 * 60 * 60;
