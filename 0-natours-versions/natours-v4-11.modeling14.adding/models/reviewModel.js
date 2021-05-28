import mongoose from 'mongoose';

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

const Review = mongoose.model(`Review`, reviewSchema);

export default Review;
