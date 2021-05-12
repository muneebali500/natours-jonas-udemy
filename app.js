import express from 'express';
import morgan from 'morgan';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';

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

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use(`/api/v1/tours`, tourRouter);
app.use(`/api/v1/users`, userRouter);

export default app;
