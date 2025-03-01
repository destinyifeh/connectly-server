import bcrypt from 'bcrypt';
import env from 'dotenv';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import path from 'path';
import {SERVER_BASE_URL} from './constants.js';
env.config();

// Create a write stream for the log file (in append mode)
export const logStream = fs.createWriteStream(
  path.join('public', 'logs/access.log'),
  {flags: 'a'},
);

export const comparePassword = async (plainPass, hashedPass) => {
  const compare = await bcrypt.compare(plainPass, hashedPass);
  console.log(compare, 'compare pass');
  return compare;
};

export const encryptPassword = async password => {
  const salt = await bcrypt.genSalt(10);
  const hashThePassword = await bcrypt.hash(password, salt);
  console.log(hashThePassword, 'hash pass');
  return hashThePassword;
};

export function formatFilePath(filePath) {
  //(filePath, 'filesss');

  const formattedPath = filePath.replace(/^public\//, '');

  return `${SERVER_BASE_URL}/${formattedPath}`;
}

export const generateTokenEngine = () => {
  const generatedToken = Math.random().toString().substring(2, 6);
  return generatedToken;
};

export const tokenExpirationPeriod = () => {
  const expireTime = Date.now() + 3600000;
  return expireTime;
};

export function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function capitalizeWords(str) {
  return str
    .split(' ') // Split the string into an array of words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(' '); // Join the words back into a single string
}

export const generateAccessToken = user => {
  return jwt.sign({userId: user._id}, process.env.SECRET_KEY, {
    //expiresIn: '15m',
    expiresIn: '1m',
  });
};

export const generateRefreshToken = user => {
  return jwt.sign({userId: user._id}, process.env.REFRESH_SECRET_KEY, {
    // expiresIn: '7d',
    expiresIn: '3m',
  });
};
