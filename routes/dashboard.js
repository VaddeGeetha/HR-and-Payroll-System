const express = require("express");

const router = express.Router();

const {
  getDashboardStats,
  getDashboardCharts
} = require("../controllers/dashboardController");

const authorize = require("../middleware/authorize");

// Dashboard statistics
router.get(
  "/stats",
  authorize("hr"),
  getDashboardStats
);

// Dashboard charts
router.get(
  "/charts",
  authorize("hr"),
  getDashboardCharts
);

module.exports = router;