const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const {
  createProject,
  getMyProjects,
} = require("../controllers/project.controller");

const router = express.Router();

router.post("/", authMiddleware, createProject);

router.get("/", authMiddleware, getMyProjects);

module.exports = router;