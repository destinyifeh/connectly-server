import * as authController from './auth.js';

import * as usersController from './users.js';

import * as chatController from './chat.js';
import * as notificationController from './notification.js';
export default {
  ...authController,
  ...usersController,
  ...chatController,
  ...notificationController,
};
