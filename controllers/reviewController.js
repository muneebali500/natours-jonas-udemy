import catchAsync from '../utils/catchAsync.js';
import Review from '../models/reviewModel.js';
import AppError from '../utils/appError.js';

export const getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({});

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
  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: `success`,
    data: {
      review: newReview,
    },
  });
});
