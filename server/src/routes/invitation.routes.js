const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");

const {
  sendInvitation,
  getReceivedInvitations,
  acceptInvitation,
  rejectInvitation,
} = require("../controllers/invitation.controller");

const router = express.Router();

router.post("/", authMiddleware, sendInvitation);

router.get("/", authMiddleware, getReceivedInvitations);

router.patch("/:id/accept", authMiddleware, acceptInvitation);

router.patch("/:id/reject", authMiddleware, rejectInvitation);

module.exports = router;