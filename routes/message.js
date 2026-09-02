const express = require("express");

const router = express.Router();

const {
  getMessages,
  sendMessage
} = require("../controllers/messageController");

const authorize = require("../middleware/authorize");

router.get(
  "/",
  authorize("hr"),
  getMessages
);

router.post(
  "/",
  authorize("employee"),
  sendMessage
);

module.exports = router;