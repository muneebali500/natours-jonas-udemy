import mongoose from 'mongoose';
import slugify from 'slugify';
import validator from 'validator';
// import User from './userModel.js';

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, `A tour must have a name`],
      unique: true,
      trim: true,
      maxlength: [40, `A tour must have less or equal than 40 characters`],
      minlength: [10, `A tour must have more or equal than 10 characters`],
      // validate: [validator.isAlpha, `Tour name must only contain chracters`],
    },
    duration: {
      type: Number,
      required: [true, `A tour must have a duration`],
    },
    maxGroupSize: {
      type: Number,
      required: [true, `A tour must have a group size`],
    },
    difficulty: {
      type: String,
      required: [true, `A tour must have a difficulty`],
      enum: {
        values: [`easy`, `medium`, `difficult`],
        message: `Difficulty is either: easy, medium or difficult`,
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, `Rating must be equal or above 1.0`],
      max: [5, `Rating must be equal or below 5.0`],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, `A tour must have a price`],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation. this is not going to work on update
          return val < this.price; // 150 > 100
        },
        message: `Discount price should be below regular price`,
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, `A tour must have a summary`],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, `A tour must have a cover image`],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // this will hide the property
    },
    startDates: [Date],
    slug: String,
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: `Point`,
        enum: [`Point`],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: `Point`,
          enum: [`Point`],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: `User` }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

tourSchema.virtual(`durationWeeks`).get(function () {
  return this.duration / 7;
});

// Virtual populate
tourSchema.virtual(`reviews`, {
  ref: `Review`,
  foreignField: `tour`,
  localField: `_id`,
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre(`save`, function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Embedding guides into tour when tour is created
// tourSchema.pre(`save`, async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre(`save`, function () {
//   console.log(`will save document`);
//   next();
// });

// tourSchema.post(`save`, function (doc, next) {
//   console.log(doc);
//   next();
// })

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: `guides`,
    select: `-__v`,
  });

  next();
});

tourSchema.post(/^find/, function (doc, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre(`aggregate`, function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  // console.log(this.pipeline());
  next();
});

const Tour = mongoose.model(`Tour`, tourSchema);

export default Tour;
