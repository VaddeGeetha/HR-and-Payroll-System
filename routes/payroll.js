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

// Employee → see their payslips
router.get("/my-payslips", authorize("employee"), getMyPayroll);

// HR → run company payroll
router.post("/run", authorize("hr"), runPayroll);

// Download payslip
router.get("/:id/download", downloadPayslip);

module.exports = router;