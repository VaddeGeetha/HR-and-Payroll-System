const express = require("express");

const router = express.Router();

const {
  getPayroll,
  getMyPayroll,
  runPayroll,
  downloadPayslip
} = require("../controllers/payrollController");

const authorize = require("../middleware/authorize");

// HR → see all payroll
router.get("/", authorize("hr"), getPayroll);

// Employee → see only their own payroll
router.get("/my", authorize("employee"), getMyPayroll);

// HR → run payroll
router.post("/run", authorize("hr"), runPayroll);

// Payslip download
router.get("/:id/download", downloadPayslip);

module.exports = router;