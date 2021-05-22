// built-in-module import
import { promisify } from 'util';
import crypto from 'crypto';

// Third party and custom modules import
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';
import sendEmail from '../utils/email.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

export const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const token = signToken(newUser._id);
  res.status(201).json({
    status: `success`,
    token,
    user: newUser,
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(
      new AppError(`Please provide both the email and password`, 400)
    );
  }

  // 2) Check if user exist and password is correct
  const user = await User.findOne({ email }).select(`+password`);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(`Please provide correct email or password`, 401));
  }

  // 3) If everything ok, send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: `success`,
    token,
  });
});

export const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith(`Bearer`)
  ) {
    token = req.headers.authorization.split(` `)[1];
  }

  if (!token) {
    return next(
      new AppError(`Sorry, your are not logged in. Please login first`, 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  // 3) Check if user still exists (e.g: user has been removed but token exist)
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        `The user belonging to this token does not exist. Please login`,
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPssswordAfter(decoded.iat)) {
    return next(
      new AppError(`User recently changed password. Please login again`, 401)
    );
  }

  req.user = currentUser;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // role [`admin`, `lead-guide`]. role = user;
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`You do not have permission to perform this action`, 403)
      );
    }

    next();
  };
};

export const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get the user based on the posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError(`There is no user with this email address`, 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    `host`
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password. Submit a PATCH request with your new password and password confirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Your password reset token (valid for 10 min)`,
      message,
    });

    res.status(200).json({
      status: `success`,
      message: `Token sent to email!`,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        `There was an error sending the email. Please try again`,
        500
      )
    );
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash(`sha256`)
    .update(req.params.token)
    .digest(`hex`);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError(`Token is invalid or has expired`, 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update passwordChangedAt property for the user

  // 4) Log the user in, send JWT
  const token = signToken(user._id);
  res.status(201).json({
    status: `success`,
    token,
  });
});
