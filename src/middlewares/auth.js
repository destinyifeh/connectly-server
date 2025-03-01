import jwt from 'jsonwebtoken';
import {User} from '../models/users.js';

export const verifyUser = async (req, res, next) => {
  console.log(req.user, 'my verify user');
  console.log(req.params, 'my verify params');
  try {
    const user = await User.findById(req.params.id);
    //console.log(user, 'user');

    if (!user) {
      return res
        .status(401)
        .json({message: 'Unauthorized. User does not exist.'});
    }

    if (!user.isActive) {
      return res.status(403).json({message: 'User account is inactive.'});
    }
    req.user = user;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Error verifying session:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error,
      status: 'error',
      code: '500',
    });
  }
};

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log(token, 'tokeeee');
  if (!token) {
    return res.status(401).json({message: 'Unauthorized: No token provided'});
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      console.log(err, 'err token');
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({message: 'Unauthorized: Token expired'});
      } else {
        return res.status(403).json({message: 'Forbidden: Invalid token'});
      }
    }

    req.user = user;
    next();
  });
};
