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

// HR/Admin → view all leaves
router.get("/", authorize("hr", "admin"), getLeaves);

// HR/Admin → view pending leaves
router.get("/pending", authorize("hr", "admin"), getPendingLeaves);

// Employee → view own leaves and balance
router.get("/my-leaves", authorize("employee"), getMyLeaves);

// Employee → apply leave
router.post("/", authorize("employee"), applyLeave);

// HR/Admin → approve leave
router.put("/:id/approve", authorize("hr", "admin"), approveLeave);

// HR/Admin → reject leave
router.put("/:id/reject", authorize("hr", "admin"), rejectLeave);

module.exports = router;