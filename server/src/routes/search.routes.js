const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");

const {
  globalSearch,
} = require("../controllers/search.controller");

const router = express.Router();

router.get("/", authMiddleware, globalSearch);

module.exports = router;