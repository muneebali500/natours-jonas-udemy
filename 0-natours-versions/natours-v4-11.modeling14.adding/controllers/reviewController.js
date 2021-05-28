import catchAsync from '../utils/catchAsync.js';
import Review from '../models/reviewModel.js';
import AppError from '../utils/appError.js';

export const getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  if (!reviews) {
    return next(new AppError(`No reviews are found`, 400));
  }

  res.status(200).json({
    status: `success`,
    result: reviews.length,
    data: {
      reviews,
    },
  });
});

export const getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError(`No review with this id is found`, 400));
  }

  res.status(200).json({
    status: `success`,
    data: {
      review,
    },
  });
});

export const createReview = catchAsync(async (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: `success`,
    data: {
      review: newReview,
    },
  });
});
