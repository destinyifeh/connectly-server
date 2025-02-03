import {Router} from 'express';
import controllers from '../controllers/index.js';
import upload from '../middlewares/image-uploader.js';
import {limiter} from '../middlewares/rate-limit.js';

const router = Router();
router.get('/api/v1/user/login', limiter, controllers.loginController);
router.get('/api/v1/user/signup', controllers.signupController);
router.get('/api/v1/users', limiter, controllers.getUsersController);
router.delete('/api/v1/user/delete/:id', controllers.deleteUserController);
router.put('/api/v1/user/update/:id', controllers.updateUserController);
router.get('/api/v1/user/:id', controllers.getCurrentUserController);
router.delete(
  '/api/v1/user/photo-delete/:id',
  controllers.deleteUserPhotoController,
);
router.put(
  '/api/v1/user/photo-upload/:id',
  upload.single('otherPhoto'),
  controllers.updateUserPhotoController,
);

router.put('/api/v1/user/block-user/:id', controllers.blockUserController);

router.put('/api/v1/user/unblock-user/:id', controllers.unBlockUserController);

router.put(
  '/api/v1/user/add-to-favourites/:id',
  controllers.userFavouritesController,
);

router.put(
  '/api/v1/user/remove-from-favourites/:id',
  controllers.removeUserFromFavouritesController,
);

router.put('/api/v1/user/report/:id', controllers.reportUserController);

export default router;
