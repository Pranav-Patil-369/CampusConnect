const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const {
  getStudentProfile,
} = require("../controllers/public-profile.controller");

const router = express.Router();

router.get("/:id", authMiddleware, getStudentProfile);

module.exports = router;