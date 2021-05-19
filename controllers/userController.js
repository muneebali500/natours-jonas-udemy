import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

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
