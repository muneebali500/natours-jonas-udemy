import fs from 'fs';
import path from 'path';
const __dirname = path.resolve();

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

export const getAllTours = (req, res) => {
  res.status(200).json({
    status: `success`,
    requestedAt: req.requestTime,
    result: tours.length,
    data: {
      tours,
    },
  });
};

export const getTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);

  if (!tour) {
    return res.status(404).json({
      status: `fail`,
      message: `invalid id`,
    });
  }

  res.status(200).json({
    status: `success`,
    data: {
      tour,
    },
  });
};

export const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  console.log(newTour);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: `success`,
        data: {
          tour: newTour,
        },
      });
    }
  );
};

export const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: `fail`,
      message: `invalid id`,
    });
  }

  res.status(200).json({
    status: `success`,
    tour: `<update tour>`,
  });
};

export const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: `fail`,
      message: `invalid id`,
    });
  }

  res.status(204).json({
    // 204 means no content
    status: `success`,
    tour: null,
  });
};
