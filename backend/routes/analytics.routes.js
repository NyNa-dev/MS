// routes/analyticsRoutes.js
import express from "express";
import { getAnalyticsStatus, getDailyAnalytics } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/status/:userId", getAnalyticsStatus);         // tells if yesterday ready & availableAt
router.get("/daily/:userId/:date", getDailyAnalytics);      // fetch analytics for given date

export default router;
