const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const {
  getTeamRecommendations,
} = require("../controllers/team-finder.controller");

const router = express.Router();

router.get("/", authMiddleware, getTeamRecommendations);

module.exports = router;