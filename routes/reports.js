const express = require("express");

const router = express.Router();

const {
  getReports
} = require("../controllers/reportsController");

const authorize = require("../middleware/authorize");

router.get(
  "/",
  authorize("hr"),
  getReports
);

module.exports = router;