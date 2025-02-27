import {Router} from 'express';
import controllers from '../controllers/index.js';
import {verifyUser} from '../middlewares/auth.js';
import upload from '../middlewares/image-uploader.js';
import {limiter} from '../middlewares/rate-limit.js';
import {
  changePasswordValidation,
  forgotValidation,
  loginValidation,
  resetValidation,
  tokenValidation,
} from '../utils/validators/auth-validators.js';
const router = Router();

router.post(
  '/api/v1/user/login',
  limiter,
  loginValidation,
  controllers.loginController,
);
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

router.put(
  '/api/v1/user/change-password/:id',
  verifyUser,
  changePasswordValidation,
  controllers.changePasswordController,
);

router.post('/api/v1/user/google-auth', controllers.googleAuthController);

router.post(
  '/api/v1/user/validate-google-auth',
  controllers.validateGoogleAuthUserController,
);
export default router;
