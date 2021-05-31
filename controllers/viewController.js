import Tour from '../models/tourModel.js';
import catchAsync from '../utils/catchAsync.js';

export const getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render(`overview`, {
    title: `All Tours`,
    tours,
  });
});

export const getTour = (req, res) => {
  res.status(200).render(`tour`, {
    title: `The Forest Hiker Tour`,
  });
};
