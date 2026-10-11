const prisma = require("../lib/prisma");

const globalSearch = async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();

    if (!query) {
      return res.status(200).json({
        students: [],
        projects: [],
        opportunities: [],
      });
    }

    const searchTerm = query.toLowerCase();

    const [students, projects, opportunities] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            {
              name: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              profile: {
                is: {
                  skills: {
                    contains: searchTerm,
                    mode: "insensitive",
                  },
                },
              },
            },
            {
              profile: {
                is: {
                  interests: {
                    contains: searchTerm,
                    mode: "insensitive",
                  },
                },
              },
            },
            {
              profile: {
                is: {
                  college: {
                    contains: searchTerm,
                    mode: "insensitive",
                  },
                },
              },
            },
          ],
        },
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
        take: 5,
      }),

      prisma.project.findMany({
        where: {
          OR: [
            {
              name: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          description: true,
          teamSize: true,
          duration: true,
          roles: {
            select: {
              role: true,
            },
          },
        },
        take: 5,
      }),

      prisma.opportunity.findMany({
        where: {
          OR: [
            {
              title: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              organization: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              type: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          id: true,
          title: true,
          organization: true,
          type: true,
          deadline: true,
        },
        take: 5,
      }),
    ]);

    res.status(200).json({
      students,
      projects,
      opportunities,
    });
  } catch (error) {
    console.error("Global search error:", error);

    res.status(500).json({
      message: "Search failed",
    });
  }
};

module.exports = {
  globalSearch,
};