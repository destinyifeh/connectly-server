import bodyParser from 'body-parser';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import './src/configs/passport.config.js';
import routes from './src/routes/index.js';
import {dev_env, mongoURI} from './src/utils/constants.js';
import {logStream} from './src/utils/helpers.js';
dotenv.config();

export const initializeApp = () => {
  const app = express();

  if (dev_env) {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined', {stream: logStream}));
  }
  app.use(helmet());
  app.use(express.json());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(
    session({
      secret: process.env.STORE_SECRET,
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 60000 * 10,
      },
      store: MongoStore.create({
        mongoUrl: mongoURI,
      }),
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(routes);
  app.use(cors());
  //app.use(limiter);
  //app.use(globalErrorHandler);
  //app.use('/uploads', express.static('public/uploads'));
  app.get('*', (req, res) => res.send('404 Resource Not Found'));
  return app;
};
