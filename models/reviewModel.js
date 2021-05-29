import mongoose from 'mongoose';
import Tour from '../models/tourModel.js';

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      trim: true,
      required: [true, `Review can not be empty`],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Number,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: `Tour`,
      required: [true, `A review must must belong to a tour`],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: `User`,
      required: [true, `A review must belong to a user`],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: `tour`,
  //     select: [`-guides`, `name`],
  //   }).populate({
  //     path: `user`,
  //     select: `name`,
  //   });

  this.populate({
    path: `user`,
    select: `name`,
  });

  next();
});

// User is allowed to create one review for a single tour (disallowing multiple reviews)
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.statics.caclAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: `$tour`,
        nRating: { $sum: 1 },
        avgRating: { $avg: `$rating` },
      },
    },
  ]);

  // console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post(`save`, function () {
  this.constructor.caclAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does not work here, query has already been executed
  await this.r.constructor.caclAverageRatings(this.r.tour);
});

const Review = mongoose.model(`Review`, reviewSchema);

export default Review;
