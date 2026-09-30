const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const {
  getMyProfile,
  upsertMyProfile,
} = require("../controllers/profile.controller");

const router = express.Router();

router.get("/", authMiddleware, getMyProfile);

router.put("/", authMiddleware, upsertMyProfile);

module.exports = router;