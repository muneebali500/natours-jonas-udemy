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
  getToursWithin,
  getDistances,
} from '../controllers/tourController.js';

import { protect, restrictTo } from './../controllers/authController.js';
// import { createReview } from '../controllers/reviewController.js';
import reviewRouter from '../routes/reviewRoutes.js';

const router = express.Router();

// router.param(`id`, checkID);

// POST /tour/123456/reviews
// GET /tour/123456/reviews
// GET /tour/123456/reviews/123446

router.use(`/:tourId/reviews`, reviewRouter);

router.route(`/top-5-cheap`).get(aliasTopTours, getAllTours);
router.route(`/tour-stats`).get(getTourStats);
router
  .route(`/monthly-plan/:year`)
  .get(protect, restrictTo(`admin`, `lead-guide`, `guide`), getMonthlyPlan);

router
  .route(`/tours-within/:distance/center/:latlng/unit/:unit`)
  .get(getToursWithin);
// /tours-distance?distance=34&center=34,12&unit=mi
// /tours-distance/34/center/34,12/unit/mi

router.route(`/distances/:latlng/unit/:unit`).get(getDistances);

router
  .route(`/`)
  .get(getAllTours)
  .post(protect, restrictTo(`admin`, `lead-guide`), createTour);
router
  .route(`/:id`)
  .get(getTour)
  .patch(protect, restrictTo(`admin`, `lead-guide`), updateTour)
  .delete(protect, restrictTo(`admin`, `lead-guide`), deleteTour);

export default router;
