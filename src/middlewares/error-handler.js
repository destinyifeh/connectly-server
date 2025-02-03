import {prod_env} from '../utils/constants.js';

export const globalErrorHandler = (err, req, res, next) => {
  console.error(err.message, 'global err');
  const errStatus = err.statusCode || 500;
  //console.error(err.stack, 'global err location');
  res.status(err.status || 500).json({
    status: 'error',
    code: errStatus,
    message: err.message,
    stack: prod_env ? undefined : err.stack,
  });
};
