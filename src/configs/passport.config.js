import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import {User} from '../models/users.js';
import {comparePassword} from '../utils/helpers.js';

export default passport.use(
  new LocalStrategy(
    {usernameField: 'email', passwordField: 'password'},
    async (email, password, done) => {
      try {
        const findUser = await User.findOne({email});
        console.log(findUser, 'finddd');
        if (!findUser) {
          return done(null, false, {message: 'User not found'});
        }

        const isMatch = await comparePassword(password, findUser.password);
        if (!isMatch) {
          return done(null, false, {message: 'Incorrect credentials'});
        }

        return done(null, findUser);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const findUser = await User.findById(id);
    if (!findUser) {
      throw new Error('User not found');
    }
    done(null, findUser);
  } catch (err) {
    done(err, null);
  }
});
