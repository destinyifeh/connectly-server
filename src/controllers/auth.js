import {config} from 'dotenv';
import {validationResult} from 'express-validator';
import jwt from 'jsonwebtoken';
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
  generateAccessToken,
  generateRefreshToken,
  generateTokenEngine,
} from '../utils/helpers.js';
config();
export const loginController = async (req, res, next) => {
  try {
    const {
      body: {email, password},
    } = req;

    console.log(req.body, 'body-login');
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({
        error: result.array(),
        status: 'error',
        message: 'Invalid or incomplete form data',
        code: '400',
      });
    }
    let allowLocalAuth = false;
    if (allowLocalAuth) {
      console.log('localAuth');
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
          return res.status(401).json({
            message: 'Invalid credentials',
            status: 'error',
            code: '401',
          });
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
          const accessToken = generateAccessToken(user);
          const refreshToken = generateRefreshToken(user);
          res.status(200).json({
            message: 'Login successful',
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: user,
            code: '200',
            status: 'success',
          });
        });
      })(req, res, next);
      return;
    }

    const findUser = await User.findOne({email});
    console.log(findUser, 'findLoginUserDez');
    if (!findUser) {
      return res
        .status(404)
        .json({message: 'User not found', code: '404', status: 'error'});
    }

    const isMatch = await comparePassword(password, findUser.password);
    if (!isMatch) {
      return res
        .status(404)
        .json({message: 'Incorrect credentials', code: '404', status: 'error'});
    }
    const accessToken = generateAccessToken(findUser);
    const refreshToken = generateRefreshToken(findUser);
    res.status(200).json({
      message: 'Login successful',
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: findUser,
      code: '200',
      status: 'success',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'error',
      code: '500',
      message: 'Internal server error',
      error: err,
    });
  }
};

export const signupController = async (req, res) => {
  try {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({
        error: result.array(),
        status: 'error',
        message: 'Invalid or incomplete form data',
        code: '400',
      });
    }

    const {body, file} = req;

    const findEmailVerifiedUser = await User.findOne({email: body.email});

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

    try {
      let saveUser = await User.create(userDoc);

      let token = generateTokenEngine();
      saveUser.verifyToken = token;
      saveUser.verifyTokenExpires = Date.now() + 3600000; //1 hour
      await emailTokenVerifierSender(saveUser);
      await saveUser.save();

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
    res.status(500).json({
      status: 'error',
      code: '500',
      message: 'Internal server error',
      error: err,
    });
  }
};

export const forgotPasswordController = async (req, res) => {
  const {email} = req.body;
  const result = validationResult(req);

  if (!result.isEmpty()) {
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
    res.status(500).json({
      status: 'error',
      code: '500',
      message: 'Internal server error',
      error: err,
    });
  }
};

export const verifyPasswordResetTokenController = async (req, res) => {
  const {otp, email} = req.body;
  const token = otp;
  const result = validationResult(req);

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
      return res
        .status(200)
        .json({message: 'Token is valid', status: 'success', code: '200'});
    } else {
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
      verifyTokenExpires: {$gt: Date.now()},
    });
    if (user) {
      const compareUserPassword = await comparePassword(
        password,
        user.password,
      );

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
    res.status(500).json({
      status: 'error',
      code: '500',
      message: 'Internal server error',
      error: err,
    });
  }
};

export const verifyTokenController = async (req, res) => {
  const {otp, email} = req.body;
  const token = otp;
  const result = validationResult(req);

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
      console.log(verifyToken, 'verify token');
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
      return res.status(401).json({
        message: 'Email verification token is invalid or has expired',
        code: 401,
        status: 'error',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      code: '500',
      message: 'Internal server error',
      error: err,
    });
  }
};

export const resendVerificationTokenController = async (req, res) => {
  try {
    const result = validationResult(req);

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
    res.status(500).json({
      status: 'error',
      code: '500',
      message: 'Internal server error',
      error: err,
    });
  }
};

export const changePasswordController = async (req, res) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json({
      error: result.array(),
      status: 'error',
      message: 'Invalid or incomplete form data',
      code: '400',
    });
  }
  const {
    params: {id},
    body: {password},
    user,
  } = req;

  try {
    const compareUserPassword = await comparePassword(password, user.password);

    if (compareUserPassword === true) {
      return res.status(401).json({
        message: 'New password must be different from the old one.',
        code: '401',
        status: 'error',
      });
    }
    let securePassword = await encryptPassword(password);
    user.password = securePassword;
    await user.save();
    res.status(200).json({
      code: '200',
      message: 'Password updated. Please log in again.',
      status: 'success',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'error',
      code: '500',
      message: 'Internal server error',
      error: err,
    });
  }
};

export const googleAuthController = async (req, res) => {
  try {
    const {body} = req;

    const userDoc = {
      isEmailVerified: true,
      username: body.givenName,
      country: body.country,
      city: body.city,
      state: body.state,
      dob: body.dob,
      email: body.email,
      age: body.age,
      gender: body.gender,
      hobbies: body.hobbies,
      password: body.id,
      profilePhoto: {
        url: body.photo,
      },
      isGoogleAuthUser: true,
    };

    const user = await User.create(userDoc);

    await emailSuccessSignupSender(body);
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    return res.status(200).json({
      message: 'Welcome to Connectly!',
      user: user,
      accessToken: accessToken,
      refreshToken: refreshToken,
      code: '200',
      status: 'success',
    });
  } catch (err) {
    console.log(err, 'g auth err');
    res.status(500).json({
      status: 'error',
      code: '500',
      message: 'Internal server error',
      error: err,
    });
  }
};

export const validateGoogleAuthUserController = async (req, res) => {
  try {
    const {
      body: {email},
    } = req;

    const user = await User.findOne({email});

    if (!user) {
      return res
        .status(404)
        .json({message: 'User not found', code: '404', status: 'not-found'});
    } else if (user && !user.isGoogleAuthUser) {
      return res.status(409).json({
        message: 'Email already exists. Please log in instead.',
        code: '409',
        status: 'notGoogleAuthUser',
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    return res.status(200).json({
      message: 'User found',
      code: '200',
      user: user,
      accessToken: accessToken,
      refreshToken: refreshToken,
      status: 'success',
    });
  } catch (err) {
    console.log(err, 'g auth err');
    res.status(500).json({
      status: 'error',
      code: '500',
      message: 'Internal server error',
      error: err,
    });
  }
};

export const refreshTokenController = async (req, res) => {
  try {
    const {refreshToken} = req.body;

    if (!refreshToken || typeof refreshToken !== 'string') {
      return res
        .status(401)
        .json({message: 'Invalid refresh token', code: '401'});
    }

    jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res
            .status(401)
            .json({message: 'Refresh token expired', code: '401'});
        }
        return res
          .status(403)
          .json({message: 'Invalid refresh token', code: '403'});
      }

      const accessToken = generateAccessToken({_id: user.userId});
      console.log(accessToken, 'refreshedToken');
      res.json({accessToken});
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'error',
      code: '500',
      message: 'Internal server error',
      error: err,
    });
  }
};
