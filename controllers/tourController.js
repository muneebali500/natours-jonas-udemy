import Tour from '../models/tourModel.js';
import APIFeatures from '../utils/apiFeatures.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const aliasTopTours = (req, res, next) => {
  req.query.limit = `5`;
  req.query.sort = `ratingsAverage,price`;
  req.query.fields = `name,price,ratingsAverage,duration,difficulty`;
  next();
};

export const getAllTours = catchAsync(async (req, res, next) => {
  // following are mongoose methods of filtering
  // const tours = await Tour.find()
  //   .where(`duration`)
  //   .equals(req.query.duration)
  //   .where(`difficulty`)
  //   .equals(`easy`);

  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: `success`,
    result: tours.length,
    data: {
      tours,
    },
  });
});

export const getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  // const prod = process.env.NODE_ENV;
  // const produ = `development`;
  // console.log(typeof prod);
  // console.log(prod);
  // console.log(typeof produ);
  // console.log(produ);
  // console.log(prod === produ);

  if (!tour) {
    return next(new AppError(`Tour with this ID does not exist`, 404));
  }

  res.status(200).json({
    status: `success`,
    data: {
      tour,
    },
  });
});

export const createTour = catchAsync(async (req, res, next) => {
  // const newTour = new Tour({});
  // newTour.save();

  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: `success`,
    data: {
      tour: newTour,
    },
  });
});

export const updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError(`Tour with this ID does not exist`, 404));
  }

  res.status(200).json({
    status: `success`,
    tour,
  });
});

export const deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  console.log(tour);

  if (!tour) {
    return next(new AppError(`Tour with this ID does not exist`, 404));
  }

  res.status(204).json({
    // 204 means no content
    status: `success`,
    tour: null,
  });
});

export const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: `$difficulty` },
        numTours: { $sum: 1 },
        numRatings: { $sum: `$ratingsQuantity` },
        avgRating: { $avg: `$ratingsAverage` },
        avgPrice: { $avg: `$price` },
        minPrice: { $min: `$price` },
        maxPrice: { $max: `$price` },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: `EASY` } },
    // },
  ]);

  res.status(200).json({
    status: `success`,
    data: stats,
  });
});

export const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: `$startDates`,
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: `$startDates` },
        numTourStarts: { $sum: 1 },
        tours: { $push: `$name` },
      },
    },
    {
      $addFields: { month: `$_id` },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: `success`,
    data: plan,
  });
});
