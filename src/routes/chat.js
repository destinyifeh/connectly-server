import {Router} from 'express';
import chatControllers from '../controllers/index.js';
import {verifyUser} from '../middlewares/auth.js';

const router = Router();

router.get(
  '/api/v1/user/chat/:id/:receiverId',
  verifyUser,
  chatControllers.getChats,
);

export default router;
