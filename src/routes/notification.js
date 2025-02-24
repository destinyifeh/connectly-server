import {Router} from 'express';
import notificationControllers from '../controllers/index.js';
import {verifyUser} from '../middlewares/auth.js';

const router = Router();

router.post(
  '/api/v1/user/notify/:id',
  verifyUser,
  notificationControllers.addNotification,
);

router.get(
  '/api/v1/user/notifications/:id',
  verifyUser,
  notificationControllers.getMyNotifications,
);
router.put(
  '/api/v1/user/notification/viewed/:id',
  verifyUser,
  notificationControllers.updateViewedNotification,
);

export default router;
