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

const router = express.Router();

// router.param(`id`, checkID);

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
