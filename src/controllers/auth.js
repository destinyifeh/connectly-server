import {validationResult} from 'express-validator';
import passport from 'passport';
import {cloudImageUploader} from '../configs/cloud-uploader.config.js';
import {
  emailSuccessSignupSender,
  emailTokenVerifierSender,
  resetPasswordEmailSender,
} from '../configs/email-sender.config.js';
import {User} from '../models/users.js';
import {
  comparePassword,
  encryptPassword,
  generateTokenEngine,
} from '../utils/helpers.js';
export const loginController = async (req, res, next) => {
  console.log(req.body, 'bodyy');
  try {
    const result = validationResult(req);
    console.log(result, 'login val result');
    if (!result.isEmpty()) {
      return res.status(400).json({
        error: result.array(),
        status: 'error',
        message: 'Invalid or incomplete form data',
        code: '400',
      });
    }
    passport.authenticate('local', (err, user, info) => {
      console.log(err, 'err');
      console.log(info, 'info');
      console.log(user, 'userrr');
      if (info) {
        return res.status(400).json({
          message: info.message,
          status: 'error',
          code: '400',
        });
      }
      if (err) {
        console.log(err);
        return res.status(500).json({
          message: 'Authentication failed',
          description: err,
          status: 'error',
          code: '500',
        });
      }
      if (!user) {
        return res
          .status(401)
          .json({message: 'Invalid credentials', status: 'error', code: '401'});
      }
      req.login(user, loginErr => {
        if (loginErr) {
          return res.status(500).json({
            error: 'Login failed',
            message: loginErr.message,
            status: 'error',
            code: '500',
          });
        }
        res.status(200).json({
          message: 'Login successful',
          // user: {
          //   id: user._id,
          //   username: user.username,
          //   email: user.email,
          // },
          user: user,
          code: '200',
          status: 'success',
        });
      });
    })(req, res, next);
  } catch (err) {
    console.log(err);
  }
};

export const signupController = async (req, res) => {
  try {
    const result = validationResult(req);
    console.log(result, 'login val result');
    if (!result.isEmpty()) {
      return res.status(400).json({
        error: result.array(),
        status: 'error',
        message: 'Invalid or incomplete form data',
        code: '400',
      });
    }

    const {body, file} = req;
    console.log(req.body, 'bodyyyy');
    console.log(file, 'fileee');

    const findEmailVerifiedUser = await User.findOne({email: body.email});
    console.log(findEmailVerifiedUser, 'findOne');
    if (findEmailVerifiedUser && !findEmailVerifiedUser.isEmailVerified) {
      let token = generateTokenEngine();
      findEmailVerifiedUser.verifyToken = token;
      findEmailVerifiedUser.verifyTokenExpires = Date.now() + 3600000; //1 hour
      await emailTokenVerifierSender(findEmailVerifiedUser);
      await findEmailVerifiedUser.save();
      return res.status(403).json({
        message: 'Email already exist please verify your email to continue',
        code: '403',
        isEmailVerified: false,
        status: 'error',
      });
    }
    if (findEmailVerifiedUser && findEmailVerifiedUser.isEmailVerified)
      return res.status(403).json({
        status: 'Email_is_verified',
        message: 'Email already exist and verified',
        code: '403',
      });
    const signupData = body;
    const fileUploadResult = await cloudImageUploader(file.path);

    signupData.password = await encryptPassword(signupData.password);

    const userDoc = {
      ...body,
      profilePhoto: {
        url: fileUploadResult.secure_url,
        id: fileUploadResult.public_id,
      },
    };
    console.log(userDoc, 'user doc');

    try {
      let saveUser = await User.create(userDoc);
      console.log(saveUser, 'userr11');
      let token = generateTokenEngine();
      saveUser.verifyToken = token;
      saveUser.verifyTokenExpires = Date.now() + 3600000; //1 hour
      await emailTokenVerifierSender(saveUser);
      await saveUser.save();
      console.log(saveUser, 'userr');
      res.status(200).json({
        status: 'success',
        code: '200',
        message: 'Verification code sent successfully.',
      });
    } catch (saveUserErr) {
      console.log(saveUserErr, 'saveUserErr');
      res.status(500).json({
        status: 'Error',
        code: '500',
        message: 'An error occurred',
      });
    }
  } catch (err) {
    console.log(err);
  }
};

export const forgotPasswordController = async (req, res) => {
  const {email} = req.body;
  const result = validationResult(req);
  console.log(result, 'forgot val result');
  if (!result.isEmpty()) {
    console.log('Sending error response...');
    return res.status(400).json({
      error: result.array(),
      message: 'Incomplete fields',
      status: 'error',
      code: '400',
    });
  }

  try {
    let user = await User.findOne({email: email});
    if (!user) {
      return res
        .status(404)
        .json({message: 'Invalid email address', code: '404', status: 'error'});
    }
    let isForgotPasswordEmail = true;
    let token = generateTokenEngine();
    user.verifyToken = token;
    user.verifyTokenExpires = Date.now() + 3600000; //1 hour
    await resetPasswordEmailSender(user, isForgotPasswordEmail);
    await user.save();
    return res.status(200).json({
      message: 'Verification code sent successfully.',
      status: 'success',
      code: '200',
    });
  } catch (err) {
    console.log(err.message);
  }
};

export const verifyPasswordResetTokenController = async (req, res) => {
  const {otp, email} = req.body;
  const token = otp;
  const result = validationResult(req);
  console.log(result, 'token val result');
  if (!result.isEmpty()) {
    return res.status(400).json({
      error: result.array(),
      status: 'error',
      message: 'Invalid or incomplete form data',
      code: '400',
    });
  }
  try {
    let user = await User.findOne({
      email: email,
      verifyToken: token,
      verifyTokenExpires: {$gt: Date.now()},
    });
    if (user) {
      let resetPasswordToken = token;
      console.log(resetPasswordToken);
      return res
        .status(200)
        .json({message: 'Token is valid', status: 'success', code: '200'});
    } else {
      console.log('Password reset token is invalid or has expired');
      return res.status(400).json({
        message: 'Password reset token is invalid or has expired',
        code: '400',
        status: 'error',
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({code: '500', message: 'Server error' + error, status: 'error'});
  }
};

export const userNewPasswordController = async (req, res) => {
  const {password, email} = req.body;
  const result = validationResult(req);
  console.log(result, 'reset val result');
  if (!result.isEmpty()) {
    return res.status(400).json({
      error: result.array(),
      status: 'error',
      message: 'Invalid or incomplete form data',
      code: '400',
    });
  }
  try {
    console.log(req.body);

    let user = await User.findOne({
      email: email,
      verifyTokenExpires: {$gt: Date.now()},
    });
    if (user) {
      const compareUserPassword = comparePassword(password, user.password);
      console.log(compareUserPassword, 'compare user');
      if (compareUserPassword === true) {
        return res.status(401).json({
          message: 'Old password and new password must not be the same',
          code: '401',
          status: 'error',
        });
      }
      let securePassword = await encryptPassword(password);

      user.password = securePassword;
      user.verifyToken = undefined;
      user.verifyTokenExpires = undefined;
      await user.save();
      await resetPasswordEmailSender(user);
      res.status(200).json({
        code: '200',
        message: 'Password updated successfully. Please log in again.',
        status: 'success',
      });
    }

    res.status(401).json({
      status: 'error',
      code: '401',
      message: 'Password reset failed',
    });
  } catch (err) {
    console.log(err, 'new pass err');
  }
};

export const verifyTokenController = async (req, res) => {
  const {otp, email} = req.body;
  const token = otp;
  const result = validationResult(req);
  console.log(result, 'token val result');
  if (!result.isEmpty()) {
    return res.status(400).json({
      error: result.array(),
      status: 'error',
      message: 'Invalid or incomplete form data',
    });
  }
  try {
    let user = await User.findOne({
      email: email,
      verifyToken: token,
      verifyTokenExpires: {$gt: Date.now()},
    });
    if (user) {
      let verifyToken = token;
      console.log(verifyToken);
      user.verifyToken = undefined;
      user.verifyTokenExpires = undefined;
      user.isEmailVerified = true;
      await user.save();
      await emailSuccessSignupSender(user);
      return res.status(200).json({
        status: 'success',
        message: 'Account setup complete.',
        code: '200',
      });
    } else {
      console.log('Email verification token is invalid or has expired');
      return res.status(401).json({
        message: 'Email verification token is invalid or has expired',
        code: 401,
        status: 'error',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({code: 500, message: 'Server error' + error});
  }
};

export const resendVerificationTokenController = async (req, res) => {
  try {
    const result = validationResult(req);
    console.log(result, 'resend val result');
    if (!result.isEmpty()) {
      return res.status(400).json({
        error: result.array(),
        status: 'error',
        message: 'Invalid or incomplete form data',
        code: '400',
      });
    }
    const {body} = req;
    const findUser = await User.findOne({email: body.email});
    if (findUser) {
      let token = generateTokenEngine();
      findUser.verifyToken = token;
      findUser.verifyTokenExpires = Date.now() + 3600000; //1 hour
      await emailTokenVerifierSender(findUser);
      await findUser.save();
      return res.status(200).json({
        message: 'Verification code re-sent successfully.',
        code: '200',
        isEmailVerified: false,
        status: 'success',
      });
    }

    res.status(404).json({
      status: 'Error',
      code: '404',
      message: 'User not found',
    });
  } catch (err) {
    console.log(err);
  }
};
