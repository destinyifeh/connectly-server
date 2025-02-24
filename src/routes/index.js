import {Router} from 'express';
import authRouter from './auth.js';
import chatRouter from './chat.js';
import notificationRouter from './notification.js';
import usersRouter from './users.js';
const router = Router();

router.use(usersRouter);
router.use(authRouter);
router.use(chatRouter);
router.use(notificationRouter);
export default router;
