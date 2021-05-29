import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { deleteOne, updateOne, getOne, getAll } from './handlerFactory.js';

// FUNCTIONS
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

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

export const createUser = (req, res) => {
  res.status(500).json({
    status: `error`,
    message: `This route is not defined. Please use signup instead`,
  });
};

// USER's RROUTE fUNCTIONS
export const getAllUsers = getAll(User);
export const getUser = getOne(User);
// Do not update Passwords with this
export const updateUser = updateOne(User);
export const deleteUser = deleteOne(User);
