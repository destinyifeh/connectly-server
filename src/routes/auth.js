import {Router} from 'express';
import controllers from '../controllers/index.js';
import upload from '../middlewares/image-uploader.js';
import {
  forgotValidation,
  loginValidation,
  resetValidation,
  tokenValidation,
} from '../utils/validators/auth-validators.js';
const router = Router();

router.post('/api/v1/user/login', loginValidation, controllers.loginController);
router.post(
  '/api/v1/user/signup',
  upload.single('profilePhoto'),
  controllers.signupController,
);

router.post(
  '/api/v1/user/forgot-password',
  forgotValidation,
  controllers.forgotPasswordController,
);
router.post(
  '/api/v1/user/verify-password-token',
  tokenValidation,
  controllers.verifyPasswordResetTokenController,
);
router.post(
  '/api/v1/user/new-password',
  resetValidation,
  controllers.userNewPasswordController,
);

router.post(
  '/api/v1/user/verify-signup-token',
  tokenValidation,
  controllers.verifyTokenController,
);

router.post(
  '/api/v1/user/resend-token',
  controllers.resendVerificationTokenController,
);
export default router;
