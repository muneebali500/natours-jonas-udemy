import Tour from '../models/tourModel.js';

export const aliasTopTours = (req, res, next) => {
  req.query.limit = `5`;
  req.query.sort = `ratingsAverage,price`;
  req.query.fields = `name,price,ratingsAverage,duration,difficulty`;
  next();
};

export const getAllTours = async (req, res) => {
  try {
    console.log(req.query);
    // BUILD QUERY
    // 1A) FILTERING
    const queryObj = { ...req.query };
    const excludedFields = [`page`, `sort`, `limit`, `fields`];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj); // converting obj into string
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Tour.find(JSON.parse(queryStr));

    // 2) SORTING
    if (req.query.sort) {
      const sortBy = req.query.sort.split(`,`).join(` `);
      query = query.sort(sortBy);
    } else {
      query.sort(`price`); // by default value
    }

    // 3) FIELD LIMITING
    if (req.query.fields) {
      const fields = req.query.fields.split(`,`).join(` `);
      query = query.select(fields);
    } else {
      query = query.select(`-__v`); // removing '__v' field from every tour
    }

    // 4. PAGINATION
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error(`The page does not exist`);
    }

    // following are mongoose methods of filtering
    // const tours = Tour.find()
    //   .where(`duration`)
    //   .equals(req.query.duration)
    //   .where(`difficulty`)
    //   .equals(`easy`);

    // EXECUTE QUERY
    const tours = await query;

    // SEND RESPONSE
    res.status(200).json({
      status: `success`,
      result: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: `fail`,
      message: err,
    });
  }
};

export const getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: `success`,
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: `fail`,
      message: err,
    });
  }
};

export const createTour = async (req, res) => {
  try {
    // const newTour = new Tour({});
    // newTour.save();

    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: `success`,
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: `fail`,
      message: err,
    });
  }
};

export const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidator: true,
    });

    res.status(200).json({
      status: `success`,
      tour,
    });
  } catch (err) {
    res.status(404).json({
      status: `fail`,
      message: err,
    });
  }
};

export const deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      // 204 means no content
      status: `success`,
      tour: null,
    });
  } catch (err) {
    res.status(404).json({
      status: `fail`,
      message: err,
    });
  }
};
