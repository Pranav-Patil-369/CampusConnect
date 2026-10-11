const prisma = require("../lib/prisma");

const getNotifications = async (req, res) => {
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
      take: 10,
    });

    const notifications = invitations.map((invitation) => ({
      id: `invitation-${invitation.id}`,
      type: "invitation",
      invitationId: invitation.id,
      status: invitation.status,
      message:
        invitation.status === "pending"
          ? `${invitation.sender.name} invited you to join ${invitation.project.name}`
          : `Invitation to ${invitation.project.name} was ${invitation.status}`,
      sender: {
        id: invitation.sender.id,
        name: invitation.sender.name,
      },
      project: {
        id: invitation.project.id,
        name: invitation.project.name,
      },
      role: invitation.role,
      createdAt: invitation.createdAt,
    }));

    const unreadCount = invitations.filter(
      (invitation) => invitation.status === "pending"
    ).length;

    res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    res.status(500).json({
      message: "Failed to get notifications",
    });
  }
};

module.exports = {
  getNotifications,
};