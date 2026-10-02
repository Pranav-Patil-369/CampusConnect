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

module.exports = {
  createProject,
  getMyProjects,
};