import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import APIFeatures from '../utils/apiFeatures.js';

export const deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    console.log(doc);

    if (!doc) {
      return next(new AppError(`Document with this ID does not exist`, 404));
    }

    res.status(204).json({
      // 204 means no content
      status: `success`,
      data: null,
    });
  });
};

export const updateOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError(`Document with this ID does not exist`, 404));
    }

    res.status(200).json({
      status: `success`,
      data: {
        data: doc,
      },
    });
  });
};

export const createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    // const newTour = new Tour({});
    // newTour.save();

    const doc = await Model.create(req.body);

    res.status(201).json({
      status: `success`,
      data: {
        data: doc,
      },
    });
  });
};

export const getOne = (Model, popOptions) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError(`Document with this ID does not exist`, 404));
    }

    res.status(200).json({
      status: `success`,
      data: {
        data: doc,
      },
    });
  });
};

export const getAll = (Model) => {
  return catchAsync(async (req, res, next) => {
    // following are mongoose methods of filtering
    // const tours = await Tour.find()
    //   .where(`duration`)
    //   .equals(req.query.duration)
    //   .where(`difficulty`)
    //   .equals(`easy`);

    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const docs = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: `success`,
      result: docs.length,
      data: {
        data: docs,
      },
    });
  });
};
