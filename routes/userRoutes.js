import express from 'express';

import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
} from './../controllers/userController.js';

import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
} from './../controllers/authController.js';

const router = express.Router();

router.patch(`/updateMe`, protect, updateMe);

router.post(`/signup`, signup);
router.post(`/login`, login);
router.post(`/forgotPassword`, forgotPassword);
router.patch(`/resetPassword/:token`, resetPassword);
router.patch(`/updateMyPassword`, protect, updatePassword);

router.route(`/`).get(getAllUsers).post(createUser);
router.route(`/:id`).get(getUser).patch(updateUser).delete(deleteUser);

export default router;
