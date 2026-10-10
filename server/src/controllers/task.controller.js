const { z } = require("zod");

const prisma = require("../lib/prisma");

/* =========================================================
   CREATE TASK VALIDATION
========================================================= */

const createTaskSchema = z.object({
  projectId: z.number().int().positive(),

  title: z
    .string()
    .trim()
    .min(1, "Task title is required")
    .max(200, "Task title is too long"),

  description: z
    .string()
    .trim()
    .max(1000, "Task description is too long")
    .optional()
    .nullable(),

  assigneeId: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
});

/* =========================================================
   CREATE TASK
========================================================= */

const createTask = async (req, res) => {
  try {
    const userId = req.user.userId;

    const parsed = createTaskSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid task data",
        errors: parsed.error.flatten(),
      });
    }

    const {
      projectId,
      title,
      description,
      assigneeId,
    } = parsed.data;

    /* -----------------------------------------------------
       Check whether project exists
    ----------------------------------------------------- */

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        members: true,
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    /* -----------------------------------------------------
       Only creator or active team member can create tasks
    ----------------------------------------------------- */

    const isCreator = project.creatorId === userId;

    const isTeamMember = project.members.some(
      (member) =>
        member.userId === userId &&
        member.status === "active"
    );

    if (!isCreator && !isTeamMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    /* -----------------------------------------------------
       If task is assigned, verify assignee belongs to project
    ----------------------------------------------------- */

    if (assigneeId) {
      const assignee = await prisma.teamMember.findFirst({
        where: {
          id: assigneeId,
          projectId,
          status: "active",
        },
      });

      if (!assignee) {
        return res.status(400).json({
          message:
            "The selected user is not an active member of this project",
        });
      }
    }

    /* -----------------------------------------------------
       Create task
    ----------------------------------------------------- */

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description: description || null,
        assigneeId: assigneeId || null,
      },

      include: {
        assignee: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Create task error:", error);

    return res.status(500).json({
      message: "Failed to create task",
    });
  }
};

/* =========================================================
   GET PROJECT TASKS
========================================================= */

const getProjectTasks = async (req, res) => {
  try {
    const userId = req.user.userId;

    const projectId = Number(req.params.projectId);

    /* -----------------------------------------------------
       Validate project ID
    ----------------------------------------------------- */

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    /* -----------------------------------------------------
       Find project
    ----------------------------------------------------- */

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },

      include: {
        members: true,
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    /* -----------------------------------------------------
       Authorization
    ----------------------------------------------------- */

    const isCreator = project.creatorId === userId;

    const isTeamMember = project.members.some(
      (member) =>
        member.userId === userId &&
        member.status === "active"
    );

    if (!isCreator && !isTeamMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    /* -----------------------------------------------------
       Get project tasks
    ----------------------------------------------------- */

    const tasks = await prisma.task.findMany({
      where: {
        projectId,
      },

      include: {
        assignee: {
          select: {
            id: true,
            role: true,

            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      tasks,
    });
  } catch (error) {
    console.error("Get project tasks error:", error);

    return res.status(500).json({
      message: "Failed to get project tasks",
    });
  }
};

/* =========================================================
   GET MY ASSIGNED TASKS
========================================================= */

const getMyTasks = async (req, res) => {
  try {
    const userId = req.user.userId;

    /* -----------------------------------------------------
       Step 1:
       Find all active TeamMember records belonging
       to the logged-in user.
    ----------------------------------------------------- */

    const memberships = await prisma.teamMember.findMany({
      where: {
        userId,
        status: "active",
      },

      select: {
        id: true,
      },
    });

    const teamMemberIds = memberships.map(
      (membership) => membership.id
    );

    /* -----------------------------------------------------
       User is not currently a member of any project
    ----------------------------------------------------- */

    if (teamMemberIds.length === 0) {
      return res.status(200).json({
        tasks: [],
      });
    }

    /* -----------------------------------------------------
       Step 2:
       Find tasks assigned to those TeamMember records.
    ----------------------------------------------------- */

    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: {
          in: teamMemberIds,
        },
      },

      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },

        assignee: {
          select: {
            id: true,
            role: true,

            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      tasks,
    });
  } catch (error) {
    console.error("Get my tasks error:", error);

    return res.status(500).json({
      message: "Failed to get your tasks",
    });
  }
};

/* =========================================================
   UPDATE TASK STATUS
========================================================= */

const updateTaskStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    const taskId = Number(req.params.id);

    /* -----------------------------------------------------
       Validate task ID
    ----------------------------------------------------- */

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    /* -----------------------------------------------------
       Validate status
    ----------------------------------------------------- */

    const allowedStatuses = [
      "TODO",
      "IN_PROGRESS",
      "DONE",
    ];

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Use TODO, IN_PROGRESS, or DONE",
      });
    }

    /* -----------------------------------------------------
       Find task
    ----------------------------------------------------- */

    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },

      include: {
        project: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    /* -----------------------------------------------------
       Authorization
    ----------------------------------------------------- */

    const project = task.project;

    const isCreator = project.creatorId === userId;

    const isTeamMember = project.members.some(
      (member) =>
        member.userId === userId &&
        member.status === "active"
    );

    if (!isCreator && !isTeamMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    /* -----------------------------------------------------
       Update status
    ----------------------------------------------------- */

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },

      data: {
        status,
      },

      include: {
        assignee: {
          select: {
            id: true,
            role: true,

            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Task status updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task status error:", error);

    return res.status(500).json({
      message: "Failed to update task status",
    });
  }
};

/* =========================================================
   EXPORT CONTROLLERS
========================================================= */

module.exports = {
  createTask,
  getProjectTasks,
  getMyTasks,
  updateTaskStatus,
};