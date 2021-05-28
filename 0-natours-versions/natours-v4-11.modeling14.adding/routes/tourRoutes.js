import express from 'express';
import {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} from '../controllers/tourController.js';

import { protect, restrictTo } from './../controllers/authController.js';
import { createReview } from '../controllers/reviewController.js';
import reviewRouter from '../routes/reviewRoutes.js';

const router = express.Router();

// router.param(`id`, checkID);

// POST /tour/123456/reviews
// GET /tour/123456/reviews
// GET /tour/123456/reviews/123446

router.use(`/:tourId/reviews`, reviewRouter);

router.route(`/top-5-cheap`).get(aliasTopTours, getAllTours);
router.route(`/tour-stats`).get(getTourStats);
router.route(`/monthly-plan/:year`).get(getMonthlyPlan);

router.route(`/`).get(protect, getAllTours).post(createTour);
router
  .route(`/:id`)
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo(`admin`, `lead-guide`), deleteTour);

export default router;
