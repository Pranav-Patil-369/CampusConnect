const prisma = require("../lib/prisma");

const normalizeList = (value) => {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
};

const calculateOverlapScore = (myItems, candidateItems) => {
  if (myItems.length === 0 || candidateItems.length === 0) {
    return 0;
  }

  const matches = myItems.filter((item) => candidateItems.includes(item));

  return matches.length / myItems.length;
};

const calculateAvailabilityScore = (myAvailability, candidateAvailability) => {
  if (!myAvailability || !candidateAvailability) {
    return 0;
  }

  const myValue = myAvailability.toLowerCase();
  const candidateValue = candidateAvailability.toLowerCase();

  if (myValue === candidateValue) {
    return 1;
  }

  const myWords = myValue
    .split(/[\s,&/]+/)
    .map((word) => word.trim())
    .filter(Boolean);

  const candidateWords = candidateValue
    .split(/[\s,&/]+/)
    .map((word) => word.trim())
    .filter(Boolean);

  const hasOverlap = myWords.some((word) =>
    candidateWords.includes(word)
  );

  return hasOverlap ? 0.5 : 0;
};

const calculateExperienceScore = (myExperience, candidateExperience) => {
  if (!myExperience || !candidateExperience) {
    return 0;
  }

  return 1;
};

const getTeamRecommendations = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const currentUser = await prisma.user.findUnique({
      where: {
        id: currentUserId,
      },

      select: {
        id: true,
        name: true,

        profile: {
          select: {
            skills: true,
            interests: true,
            availability: true,
            experience: true,
          },
        },
      },
    });

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!currentUser.profile) {
      return res.status(400).json({
        message: "Please complete your profile before using Team Finder",
      });
    }

    const mySkills = normalizeList(currentUser.profile.skills);
    const myInterests = normalizeList(currentUser.profile.interests);

    const students = await prisma.user.findMany({
      where: {
        id: {
          not: currentUserId,
        },

        profile: {
          isNot: null,
        },
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

    const recommendations = students.map((student) => {
      const profile = student.profile;

      const candidateSkills = normalizeList(profile.skills);
      const candidateInterests = normalizeList(profile.interests);

      const skillScore = calculateOverlapScore(
        mySkills,
        candidateSkills
      );

      const interestScore = calculateOverlapScore(
        myInterests,
        candidateInterests
      );

      const availabilityScore = calculateAvailabilityScore(
        currentUser.profile.availability,
        profile.availability
      );

      const experienceScore = calculateExperienceScore(
        currentUser.profile.experience,
        profile.experience
      );

      const finalScore =
        skillScore * 50 +
        interestScore * 25 +
        availabilityScore * 15 +
        experienceScore * 10;

      const matchingSkills = mySkills.filter((skill) =>
        candidateSkills.includes(skill)
      );

      const matchingInterests = myInterests.filter((interest) =>
        candidateInterests.includes(interest)
      );

      const reasons = [];

      if (matchingSkills.length > 0) {
        reasons.push(
          `${matchingSkills.length} matching skill${
            matchingSkills.length > 1 ? "s" : ""
          }`
        );
      }

      if (matchingInterests.length > 0) {
        reasons.push(
          `${matchingInterests.length} matching interest${
            matchingInterests.length > 1 ? "s" : ""
          }`
        );
      }

      if (availabilityScore === 1) {
        reasons.push("Compatible availability");
      } else if (availabilityScore === 0.5) {
        reasons.push("Partially compatible availability");
      }

      if (experienceScore === 1) {
        reasons.push("Both have experience");
      }

      return {
        id: student.id,
        name: student.name,

        profile: {
          bio: profile.bio,
          college: profile.college,
          course: profile.course,
          year: profile.year,
          skills: profile.skills,
          interests: profile.interests,
          availability: profile.availability,
          experience: profile.experience,
        },

        matchScore: Math.round(finalScore),

        matchingSkills,
        matchingInterests,

        reasons,
      };
    });

    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      recommendations,
    });
  } catch (error) {
    console.error("Team Finder error:", error);

    res.status(500).json({
      message: "Failed to generate team recommendations",
    });
  }
};

module.exports = {
  getTeamRecommendations,
};