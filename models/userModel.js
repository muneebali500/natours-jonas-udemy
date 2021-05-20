import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, `Please provide your name`],
  },
  email: {
    type: String,
    required: [true, `Please provide your email address`],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, `Please provide a valid email`],
  },
  photo: String,
  password: {
    type: String,
    required: [true, `Please provide a password`],
    minlenght: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, `Please provide a confirm password`],
    validate: {
      // this only works on CREATE and SAVE user!!!! (not on update user)
      validator: function (el) {
        return el === this.password;
      },
      message: `Passwords do no match`,
    },
  },
  passwordChangedAt: Date,
});

// pre method to hash password
userSchema.pre(`save`, async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified(`password`)) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete password confirm field
  this.passwordConfirm = undefined;
  next();
});

// Compare the plain password by user with password in database
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// function to check if user changed the password after the toekn issued
userSchema.methods.changedPssswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    // console.log(changedTimeStamp, JWTTimestamp);
    return JWTTimestamp < changedTimeStamp;
  }

  // false means Password is NOT chnaged
  return false;
};

const User = mongoose.model(`User`, userSchema);

export default User;
