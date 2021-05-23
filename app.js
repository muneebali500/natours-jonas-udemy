import express from 'express';
import morgan from 'morgan';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

import path from 'path';
const __dirname = path.resolve();

import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Global middlewares
// Set security HTTP Headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan(`dev`));
}

// Middleware to restrict requests from one IP to max 100 per hour
const limiter = rateLimit({
  max: 3,
  windowMilliseconds: 60 * 60 * 1000,
  message: `Too many requests from this IP. Please try again in an hour`,
});
app.use(`/api`, limiter); // this will apply to all the routes starting with '/api'

// Body parser, reading data from body into req.body
app.use(express.json({ limit: `10kb` }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      `duration`,
      `ratingsAverage`,
      `ratingsQuantity`,
      `maxGroupSize`,
      `difficulty`,
      `price`,
    ],
  })
);

// Middleware to access static files like images, css, js
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTES
app.use(`/api/v1/tours`, tourRouter);
app.use(`/api/v1/users`, userRouter);

// middleware to handle unrecognised/undefined routes
app.all(`*`, (req, res, next) => {
  next(
    new AppError(`Sorry, could not find ${req.originalUrl} on this server`, 404)
  );
});

// Global error handling middleware
app.use(globalErrorHandler);

export default app;

// "kill": "kill -9 $(lsof -i :3000) &>/dev/null | exit 0"
