import mongoose from 'mongoose';
import app from './app.js';

// console.log(process.env);

// To deal with uncaught exceptions
process.on(`uncaughtException`, (err) => {
  console.log(`Uncaught exception 🔥. Shutting down...`);
  console.log(err.name, err.message);

  process.exit(1);
});

const DB = process.env.DATABASE.replace(
  `<PASSWORD>`,
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    // console.log(con.connections);
    console.log(`DB connection successful`);
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});

// To deal with unhandled promise rejection
process.on(`unhandledRejection`, (err) => {
  console.log(`Unhandled Rejection 🔥. Shutting down...`);
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
