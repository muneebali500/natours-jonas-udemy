import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

// FUNCTIONS
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

// USER's RROUTE fUNCTIONS
export const getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  // SEND RESPONSE
  res.status(200).json({
    status: `success`,
    result: users.length,
    data: {
      users,
    },
  });
});

export const updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user tries to change password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        `This route is not for password update. Please try /updatePassword route`,
        400
      )
    );
  }

  // 2) filtered out unwanted fields that are not allowed to be update
  const filteredBody = filterObj(req.body, `name`, `email`);

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: `success`,
    data: {
      user: updatedUser,
    },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: `success`,
    data: null,
  });
});

export const getUser = (req, res) => {
  res.status(500).json({
    status: `error`,
    message: `Route error please get out`,
  });
};

export const createUser = (req, res) => {
  res.status(500).json({
    status: `error`,
    message: `Route error please get out`,
  });
};

export const updateUser = (req, res) => {
  res.status(500).json({
    status: `error`,
    message: `Route error please get out`,
  });
};

export const deleteUser = (req, res) => {
  res.status(500).json({
    status: `error`,
    message: `Route error please get out`,
  });
};
