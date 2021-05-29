import express from 'express';

import {
  createReview,
  getAllReviews,
  getReview,
  deleteReview,
  updateReview,
  setTourUserIds,
} from '../controllers/reviewController.js';

import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route(`/`)
  .get(getAllReviews)
  .post(protect, restrictTo(`user`), setTourUserIds, createReview);

router.route(`/:id`).get(getReview);
router
  .route(`/:id`)
  .patch(restrictTo(`user`, `admin`), updateReview)
  .delete(restrictTo(`user`, `admin`), deleteReview);

export default router;
