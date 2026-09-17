const express = require("express");

const router = express.Router();

const {
  getMessages,
  sendMessage
} = require("../controllers/messageController");

const authorize = require("../middleware/authorize");

router.get(
  "/",
  authorize("hr","admin"),
  getMessages
);

router.post(
  "/",authorize("admin","hr",
  "employee"),
  sendMessage);


module.exports = router;