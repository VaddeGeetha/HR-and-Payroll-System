const express = require("express");

const router = express.Router();

const {
  getDashboardStats,
  getDashboardCharts,
  startWFH,
  stopWFH,
  getWFHStatus
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

// WFH Tracking Endpoints
router.post("/wfh/start", authorize("admin", "hr", "employee"), startWFH);
router.post("/wfh/stop", authorize("admin", "hr", "employee"), stopWFH);
router.get("/wfh/status", authorize("admin", "hr", "employee"), getWFHStatus);

module.exports = router;