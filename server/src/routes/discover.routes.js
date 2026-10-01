const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const { getStudents } = require("../controllers/discover.controller");

const router = express.Router();

router.get("/students", authMiddleware, getStudents);

module.exports = router;