import express from 'express';

import {
  createReview,
  getAllReviews,
  getReview,
} from '../controllers/reviewController.js';

import { protect } from '../controllers/authController.js';

const router = express.Router();

router.route(`/`).get(getAllReviews).post(protect, createReview);

router.route(`/:id`).get(getReview);

export default router;
