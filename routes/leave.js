const express = require("express");
const router = express.Router();

const {
  applyLeave,
  getMyLeaves,
  getPendingLeaves,
  getLeaves,
  approveLeave,
  rejectLeave
} = require("../controllers/leaveController");

router.post("/", applyLeave);

router.get("/", getLeaves);

router.get("/pending", getPendingLeaves);

router.get("/my-leaves", getMyLeaves);

router.put("/:id/approve", approveLeave);

router.put("/:id/reject", rejectLeave);

module.exports = router;