const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");

const {
  createTask,
  getProjectTasks,
  getMyTasks,
  updateTaskStatus,
} = require("../controllers/task.controller");

const router = express.Router();

router.post("/", authMiddleware, createTask);

router.get(
  "/project/:projectId",
  authMiddleware,
  getProjectTasks
);

router.get(
  "/my",
  authMiddleware,
  getMyTasks
);

router.patch(
  "/:id/status",
  authMiddleware,
  updateTaskStatus
);

module.exports = router;