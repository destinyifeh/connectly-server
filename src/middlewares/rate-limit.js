import {rateLimit} from 'express-rate-limit';

export const limiter = rateLimit({
  //windowMs: 15 * 60 * 1000, // 15 minutes
  windowMs: 1 * 60 * 1000, //1 minute
  limit: 2,
  //limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
  message: function (req, res /*next*/) {
    return res.json({
      message: 'too many requests',
      description:
        'You sent too many requests. Please wait a while then try again',
    });
  },
});
