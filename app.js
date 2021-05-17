import express from 'express';
import morgan from 'morgan';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import appError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';

import path from 'path';
const __dirname = path.resolve();

import dotenv from 'dotenv';
dotenv.config();

const app = express();

// middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan(`dev`));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log(`hello from the middleware`);
  next();
});

app.use(`/api/v1/tours`, tourRouter);
app.use(`/api/v1/users`, userRouter);

// middleware to handle unrecognised/undefined routes
app.all(`*`, (req, res, next) => {
  next(
    new appError(`Sorry, could not find ${req.originalUrl} on this server`, 404)
  );
});

// Global error handling middleware
app.use(globalErrorHandler);

export default app;
