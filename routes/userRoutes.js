import express from 'express';

import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
} from './../controllers/userController.js';

import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
} from './../controllers/authController.js';

const router = express.Router();

router.post(`/signup`, signup);
router.post(`/login`, login);
router.post(`/forgotPassword`, forgotPassword);
router.patch(`/resetPassword/:token`, resetPassword);

// Protect all routes after this middleware
router.use(protect);

router.patch(`/updateMyPassword`, updatePassword);
router.get(`/me`, getMe, getUser);
router.patch(`/updateMe`, updateMe);
router.delete(`/deleteMe`, deleteMe);

// Restrict all routes after this middleware
router.use(restrictTo(`admin`));

router.route(`/`).get(getAllUsers).post(createUser);
router.route(`/:id`).get(getUser).patch(updateUser).delete(deleteUser);

export default router;
