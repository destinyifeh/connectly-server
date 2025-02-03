import {body, param} from 'express-validator';

export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .trim()
    .normalizeEmail(),
  body('password')
    .isLength({min: 4})
    .withMessage('Password must be at least 6 characters long'),
  body('profilePhoto').notEmpty().withMessage('Profile photo is required'),
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .trim()
    .custom(value => {
      if (
        value === 'admin' ||
        value === 'superAdmin' ||
        value === 'superadmin'
      ) {
        throw new Error('Username cannot be "admin"');
      }
      return true;
    })
    .escape(),
  body('gender').notEmpty().withMessage('Gender is required').trim(),
  body('profilePhoto').notEmpty().withMessage('Profile photo is required'),
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .trim()
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const userParamValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
];

export const forgotValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .trim()
    .normalizeEmail(),
];

export const tokenValidation = [
  body('otp')
    .isLength({min: 4, max: 4})
    .withMessage('Token must be at least 4 characters long')
    .trim(),
];

export const resetValidation = [
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({min: 4})
    .withMessage('Password must be at least 4 characters long'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .trim()
    .normalizeEmail(),
];
