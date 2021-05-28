import AppError from '../utils/AppError.js';

// Function s throws a error message incase of incorrect ID is entered
const handleCastErrorDB = (err) => {
  // console.log(`handle cast error`);
  const message = `Invalid ${err.path}: ${err.value}`;

  return new AppError(message, 400);
};

// Function to deal with duplicate field errors
const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate field value [${value}]. Please use another value`;

  return new AppError(message, 404);
};

// Function to deal the validation errors
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(`. `)}`;

  return new AppError(message, 404);
};

const handleJWTError = () =>
  new AppError(`Invalid token. Please login again`, 401);

const handleJWTExpiredError = () =>
  new AppError(`Token has expired. Please login again`, 401);

const sendErrorDev = (err, res) => {
  // console.log(`send error development`);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // console.log(`send error production`);
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    // console.log(`operational`);
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming to other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.log(`Error 🔥`, err);

    // 2) send generate message
    res.status(500).json({
      status: `error`,
      message: `Something went wrong`,
    });
  }
};

export default function (err, req, res, next) {
  // console.log(err.stack.includes(`Cast`));

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err, name: err.name };

    if (error.name === `CastError`) error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === `ValidationError`)
      error = handleValidationErrorDB(error);
    if (error.name === `JsonWebTokenError`) error = handleJWTError();
    if (error.name === `TokenExpiredError`) error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
}
