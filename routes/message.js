const express = require("express");
const router = express.Router();

const {
  getMessages,
  sendMessage
} = require("../controllers/messageController");

const authorize = require("../middleware/authorize");

// Both GET and POST are available for admin, hr, and employee
router.get("/", authorize("admin", "hr", "employee"), getMessages);
router.post("/", authorize("admin", "hr", "employee"), sendMessage);

module.exports = router;