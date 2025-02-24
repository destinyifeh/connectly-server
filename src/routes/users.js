import {Router} from 'express';
import controllers from '../controllers/index.js';
import {verifyUser} from '../middlewares/auth.js';
import upload from '../middlewares/image-uploader.js';

const router = Router();

router.get(
  '/api/v1/active-users/:id',
  verifyUser,
  controllers.getUsersController,
);
router.delete('/api/v1/user/delete/:id', controllers.deleteUserController);
router.put('/api/v1/user/update/:id', controllers.updateUserController);
router.get('/api/v1/user/:id', controllers.getCurrentUserController);
router.delete(
  '/api/v1/user/photo-delete/:id',
  verifyUser,
  controllers.deleteUserPhotoController,
);
router.put(
  '/api/v1/user/photo-upload/:id',
  upload.single('otherPhotos'),
  verifyUser,
  controllers.updateUserOtherPhotosController,
);
router.put(
  '/api/v1/user/profile-photo-upload/:id',
  upload.single('profilePhoto'),
  verifyUser,
  controllers.updateUserProfilePhotoController,
);

router.put('/api/v1/user/block-user/:id', controllers.blockUserController);

router.put('/api/v1/user/unblock-user/:id', controllers.unBlockUserController);

router.put(
  '/api/v1/user/add-to-favourites/:id',
  verifyUser,
  controllers.userFavouritesController,
);

router.put(
  '/api/v1/user/remove-from-favourites/:id',
  verifyUser,
  controllers.removeUserFromFavouritesController,
);

router.put(
  '/api/v1/user/report/:id',
  verifyUser,
  controllers.reportUserController,
);
router.get(
  '/api/v1/search-user/:id',
  verifyUser,
  controllers.searchForUserController,
);
router.post(
  '/api/v1/user/push-token/:id',
  verifyUser,
  controllers.saveUserPushNotificationToken,
);

export default router;
