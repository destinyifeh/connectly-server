import {User} from '../models/users.js';

export const verifyUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id || req.params._id);
    console.log(user, 'user');

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
    res.status(500).json({message: 'Internal Server Error'});
  }
};
