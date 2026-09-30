const prisma = require("../lib/prisma");
const { z } = require("zod");

const profileSchema = z.object({
  bio: z.string().max(500).optional(),
  college: z.string().max(200).optional(),
  course: z.string().max(100).optional(),
  year: z.number().int().min(1).max(6).optional(),
  skills: z.string().max(1000).optional(),
  interests: z.string().max(1000).optional(),
  availability: z.string().max(200).optional(),
  experience: z.string().max(2000).optional(),
});

const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const profile = await prisma.profile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      message: "Failed to get profile",
    });
  }
};

const upsertMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const validationResult = profileSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Invalid profile data",
        errors: validationResult.error.flatten(),
      });
    }

    const profileData = validationResult.data;

    const profile = await prisma.profile.upsert({
      where: {
        userId: userId,
      },

      update: profileData,

      create: {
        userId: userId,
        ...profileData,
      },
    });

    res.status(200).json({
      message: "Profile saved successfully",
      profile,
    });
  } catch (error) {
    console.error("Save profile error:", error);

    res.status(500).json({
      message: "Failed to save profile",
    });
  }
};

module.exports = {
  getMyProfile,
  upsertMyProfile,
};