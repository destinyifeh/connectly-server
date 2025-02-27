import {rateLimit} from 'express-rate-limit';

export const limiter = rateLimit({
  //windowMs: 15 * 60 * 1000, // 15 minutes
  windowMs: 5 * 60 * 1000, //5 minute
  limit: 10,
  //limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
  message: function (req, res /*next*/) {
    return res.status(500).json({
      message: 'Too many requests.',
      description:
        'You sent too many requests. Please wait a while then try again',
    });
  },
});
