const prisma = require("../lib/prisma");

const getStudents = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const search = req.query.search?.trim() || "";

    const students = await prisma.user.findMany({
      where: {
        id: {
          not: currentUserId,
        },

        OR: search
          ? [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                profile: {
                  skills: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
              {
                profile: {
                  interests: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
              {
                profile: {
                  college: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            ]
          : undefined,
      },

      select: {
        id: true,
        name: true,

        profile: {
          select: {
            bio: true,
            college: true,
            course: true,
            year: true,
            skills: true,
            interests: true,
            availability: true,
            experience: true,
          },
        },
      },

      orderBy: {
        name: "asc",
      },
    });

    res.status(200).json(students);
  } catch (error) {
    console.error("Get students error:", error);

    res.status(500).json({
      message: "Failed to get students",
    });
  }
};

module.exports = {
  getStudents,
};