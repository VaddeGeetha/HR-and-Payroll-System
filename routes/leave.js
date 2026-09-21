const express = require("express");
const router = express.Router();

const authorize = require("../middleware/authorize");

const {
  applyLeave,
  getMyLeaves,
  getPendingLeaves,
  getLeaves,
  approveLeave,
  rejectLeave
} = require("../controllers/leaveController");

const authorize = require("../middleware/authorize");

router.post("/", authorize("admin", "hr", "employee"), applyLeave);
router.get("/", authorize("admin", "hr", "employee"), getLeaves);
router.get("/pending", authorize("admin", "hr"), getPendingLeaves);
router.get("/my-leaves", authorize("admin", "hr", "employee"), getMyLeaves);
router.put("/:id/approve", authorize("admin", "hr"), approveLeave);
router.put("/:id/reject", authorize("admin", "hr"), rejectLeave);

module.exports = router;