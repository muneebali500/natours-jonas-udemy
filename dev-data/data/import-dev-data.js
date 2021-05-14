import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import mongoose from 'mongoose';
import Tour from '../../models/tourModel.js';
import path from 'path';

const __dirname = path.resolve();

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

// READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, `utf-8`)
);

// IMPORT DATA INTO DATABASE
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log(`data successfully loaded`);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE DATA FROM DATABASE
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log(`data deleted successfully`);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === `--import`) {
  importData();
} else if (process.argv[2] === `--delete`) {
  deleteData();
}
