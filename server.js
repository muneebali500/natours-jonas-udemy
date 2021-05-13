import mongoose from 'mongoose';
import app from './app.js';

// console.log(process.env);

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
app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});
