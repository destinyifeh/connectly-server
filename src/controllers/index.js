import * as authController from './auth.js';

import * as usersController from './users.js';

import * as chatController from './chat.js';

export default {
  ...authController,
  ...usersController,
  ...chatController,
};
