const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");

const {
  getOpportunities,
  getOpportunityById,
} = require("../controllers/opportunity.controller");

const router = express.Router();

router.get("/", authMiddleware, getOpportunities);

router.get("/:id", authMiddleware, getOpportunityById);

module.exports = router;