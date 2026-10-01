const prisma = require("../lib/prisma");

const getStudentProfile = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const studentId = Number(req.params.id);

    if (Number.isNaN(studentId)) {
      return res.status(400).json({
        message: "Invalid student ID",
      });
    }

    if (studentId === currentUserId) {
      return res.status(400).json({
        message: "Use your own profile page to view your profile",
      });
    }

    const student = await prisma.user.findUnique({
      where: {
        id: studentId,
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
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error("Get student profile error:", error);

    res.status(500).json({
      message: "Failed to get student profile",
    });
  }
};

module.exports = {
  getStudentProfile,
};