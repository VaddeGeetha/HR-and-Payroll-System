const express = require("express");
const router = express.Router();

const {
  applyLeave,
  getLeaves,
  getPendingLeaves,
  approveLeave,
  rejectLeave
} = require("../controllers/leaveController");

router.post("/", applyLeave);
router.get("/", getLeaves);
router.get("/pending", getPendingLeaves);
router.put("/:id/approve", approveLeave);
router.put("/:id/reject", rejectLeave);

module.exports = router;