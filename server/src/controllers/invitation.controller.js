const prisma = require("../lib/prisma");
const { z } = require("zod");

const sendInvitationSchema = z.object({
  projectId: z.number().int().positive(),
  receiverId: z.number().int().positive(),
  role: z.string().min(1).max(100),
});

const sendInvitation = async (req, res) => {
  try {
    const senderId = req.user.userId;

    const validationResult = sendInvitationSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Invalid invitation data",
        errors: validationResult.error.flatten(),
      });
    }

    const { projectId, receiverId, role } = validationResult.data;

    // 1. Find project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        roles: true,
        members: true,
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // 2. Only project creator can send invitations
    if (project.creatorId !== senderId) {
      return res.status(403).json({
        message: "Only the project creator can send invitations",
      });
    }

    // 3. Sender cannot invite themselves
    if (receiverId === senderId) {
      return res.status(400).json({
        message: "You cannot invite yourself",
      });
    }

    // 4. Check receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!receiver) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    // 5. Check whether student is already a team member
    const existingMember = project.members.find(
      (member) => member.userId === receiverId
    );

    if (existingMember) {
      return res.status(400).json({
        message: "Student is already a member of this project",
      });
    }

    // 6. Check whether requested role belongs to project
    const projectRole = project.roles.find(
      (projectRole) =>
        projectRole.role.toLowerCase() === role.toLowerCase()
    );

    if (!projectRole) {
      return res.status(400).json({
        message: "This role is not required for the project",
      });
    }

    // 7. Check for existing invitation
    const existingInvitation = await prisma.projectInvitation.findUnique({
      where: {
        projectId_receiverId_role: {
          projectId,
          receiverId,
          role: projectRole.role,
        },
      },
    });

    if (existingInvitation) {
      return res.status(400).json({
        message: `Invitation already exists with status: ${existingInvitation.status}`,
      });
    }

    // 8. Create invitation
    const invitation = await prisma.projectInvitation.create({
      data: {
        projectId,
        senderId,
        receiverId,
        role: projectRole.role,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Invitation sent successfully",
      invitation,
    });
  } catch (error) {
    console.error("Send invitation error:", error);

    return res.status(500).json({
      message: "Failed to send invitation",
    });
  }
};


const getReceivedInvitations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const invitations = await prisma.projectInvitation.findMany({
      where: {
        receiverId: userId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            teamSize: true,
          },
        },
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      invitations,
    });
  } catch (error) {
    console.error("Get invitations error:", error);

    return res.status(500).json({
      message: "Failed to get invitations",
    });
  }
};


const acceptInvitation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const invitationId = Number(req.params.id);

    if (!Number.isInteger(invitationId)) {
      return res.status(400).json({
        message: "Invalid invitation ID",
      });
    }

    const invitation = await prisma.projectInvitation.findUnique({
      where: {
        id: invitationId,
      },
      include: {
        project: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!invitation) {
      return res.status(404).json({
        message: "Invitation not found",
      });
    }

    // Only receiver can accept
    if (invitation.receiverId !== userId) {
      return res.status(403).json({
        message: "You cannot accept this invitation",
      });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({
        message: `Invitation is already ${invitation.status}`,
      });
    }

    // Check whether project team is already full
    if (invitation.project.members.length >= invitation.project.teamSize) {
      return res.status(400).json({
        message: "Project team is already full",
      });
    }

    // Check whether user somehow became a member already
    const existingMember = invitation.project.members.find(
      (member) => member.userId === userId
    );

    if (existingMember) {
      return res.status(400).json({
        message: "You are already a member of this project",
      });
    }

    // Add user to team and update invitation together
    const result = await prisma.$transaction([
      prisma.teamMember.create({
        data: {
          projectId: invitation.projectId,
          userId,
          role: invitation.role,
          status: "active",
        },
      }),

      prisma.projectInvitation.update({
        where: {
          id: invitationId,
        },
        data: {
          status: "accepted",
        },
      }),
    ]);

    return res.status(200).json({
      message: "Invitation accepted successfully",
      membership: result[0],
      invitation: result[1],
    });
  } catch (error) {
    console.error("Accept invitation error:", error);

    return res.status(500).json({
      message: "Failed to accept invitation",
    });
  }
};


const rejectInvitation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const invitationId = Number(req.params.id);

    if (!Number.isInteger(invitationId)) {
      return res.status(400).json({
        message: "Invalid invitation ID",
      });
    }

    const invitation = await prisma.projectInvitation.findUnique({
      where: {
        id: invitationId,
      },
    });

    if (!invitation) {
      return res.status(404).json({
        message: "Invitation not found",
      });
    }

    // Only receiver can reject
    if (invitation.receiverId !== userId) {
      return res.status(403).json({
        message: "You cannot reject this invitation",
      });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({
        message: `Invitation is already ${invitation.status}`,
      });
    }

    const updatedInvitation = await prisma.projectInvitation.update({
      where: {
        id: invitationId,
      },
      data: {
        status: "rejected",
      },
    });

    return res.status(200).json({
      message: "Invitation rejected",
      invitation: updatedInvitation,
    });
  } catch (error) {
    console.error("Reject invitation error:", error);

    return res.status(500).json({
      message: "Failed to reject invitation",
    });
  }
};


module.exports = {
  sendInvitation,
  getReceivedInvitations,
  acceptInvitation,
  rejectInvitation,
};