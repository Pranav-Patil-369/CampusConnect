const prisma = require("../lib/prisma");
const { z } = require("zod");

const projectSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().min(10).max(2000),
  teamSize: z.number().int().min(1).max(20),
  duration: z.string().min(1).max(100),
  roles: z
    .array(z.string().min(1).max(100))
    .min(1)
    .max(20),
});

const createProject = async (req, res) => {
  try {
    const userId = req.user.userId;

    const validationResult = projectSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Invalid project data",
        errors: validationResult.error.flatten(),
      });
    }

    const { name, description, teamSize, duration, roles } =
      validationResult.data;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        teamSize,
        duration,
        creatorId: userId,

        roles: {
          create: roles.map((role) => ({
            role,
          })),
        },

        members: {
          create: {
            userId,
            role: "Project Creator",
          },
        },
      },

      include: {
        roles: true,
        members: {
          select: {
            id: true,
            userId: true,
            role: true,
            status: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error);

    res.status(500).json({
      message: "Failed to create project",
    });
  }
};

const getMyProjects = async (req, res) => {
  try {
    const userId = req.user.userId;

    const projects = await prisma.project.findMany({
      where: {
        creatorId: userId,
      },
      include: {
        roles: true,
        members: {
          select: {
            id: true,
            userId: true,
            role: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    res.status(500).json({
      message: "Failed to get projects",
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const projectId = Number(req.params.id);

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },

      include: {
        roles: true,

        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,

                profile: {
                  select: {
                    college: true,
                    course: true,
                    year: true,
                    skills: true,
                  },
                },
              },
            },
          },

          orderBy: {
            joinedAt: "asc",
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Only the project creator or an active team member
    // can access the project workspace.
    const isCreator = project.creatorId === userId;

    const isTeamMember = project.members.some(
      (member) =>
        member.userId === userId && member.status === "active"
    );

    if (!isCreator && !isTeamMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    res.status(200).json({
      project,
    });
  } catch (error) {
    console.error("Get project by ID error:", error);

    res.status(500).json({
      message: "Failed to get project",
    });
  }
};

module.exports = {
  createProject,
  getMyProjects,
  getProjectById,
};