const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");

const {
  createProject,
  getMyProjects,
  getProjectById,
} = require("../controllers/project.controller");

const router = express.Router();

router.post("/", authMiddleware, createProject);
router.get("/", authMiddleware, getMyProjects);
router.get("/:id", authMiddleware, getProjectById);

module.exports = router;