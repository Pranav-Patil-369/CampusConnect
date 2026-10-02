const prisma = require("../lib/prisma");

/*
  Role → skills mapping.

  For now this lives in code.
  Later, if needed, we can move roles and skills
  into database tables.
*/
const ROLE_SKILLS = {
  "AI/ML Developer": [
    "python",
    "machine learning",
    "ai",
    "artificial intelligence",
    "data science",
    "deep learning",
    "nlp",
  ],

  "Frontend Developer": [
    "react",
    "javascript",
    "html",
    "css",
    "frontend",
    "front end",
  ],

  "Backend Developer": [
    "node.js",
    "node",
    "express",
    "backend",
    "back end",
    "api",
    "rest api",
  ],

  "UI/UX Designer": [
    "figma",
    "ui design",
    "ux design",
    "ui/ux",
    "ui",
    "ux",
    "design",
  ],

  "Database Developer": [
    "postgresql",
    "postgres",
    "mysql",
    "mongodb",
    "sql",
    "database",
  ],

  "Mobile Developer": [
    "react native",
    "flutter",
    "android",
    "ios",
    "mobile development",
  ],

  "DevOps / Cloud": [
    "docker",
    "aws",
    "azure",
    "gcp",
    "devops",
    "cloud",
    "kubernetes",
  ],

  "Research / Domain Expert": [
    "research",
    "research methodology",
    "domain knowledge",
    "technical writing",
  ],
};

const normalizeList = (value) => {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
};

const getRoleSkills = (role) => {
  return ROLE_SKILLS[role] || [];
};

const calculateSkillMatch = (candidateSkills, requiredSkills) => {
  if (requiredSkills.length === 0) {
    return 0;
  }

  const matchingSkills = requiredSkills.filter((requiredSkill) =>
    candidateSkills.some(
      (candidateSkill) =>
        candidateSkill === requiredSkill ||
        candidateSkill.includes(requiredSkill) ||
        requiredSkill.includes(candidateSkill)
    )
  );

  return {
    score: matchingSkills.length / requiredSkills.length,
    matchingSkills,
  };
};

const calculateInterestMatch = (candidateInterests, role) => {
  if (candidateInterests.length === 0) {
    return 0;
  }

  const roleWords = role
    .toLowerCase()
    .split(/[\s/]+/)
    .filter(Boolean);

  const matches = candidateInterests.filter((interest) =>
    roleWords.some(
      (word) =>
        interest.includes(word) ||
        word.includes(interest)
    )
  );

  return matches.length > 0 ? 1 : 0;
};

const calculateAvailabilityMatch = (
  projectDuration,
  candidateAvailability
) => {
  if (!projectDuration || !candidateAvailability) {
    return 0;
  }

  const projectWords = projectDuration
    .toLowerCase()
    .split(/[\s,&/]+/)
    .filter(Boolean);

  const candidateWords = candidateAvailability
    .toLowerCase()
    .split(/[\s,&/]+/)
    .filter(Boolean);

  const hasOverlap = projectWords.some((word) =>
    candidateWords.includes(word)
  );

  return hasOverlap ? 1 : 0.5;
};

const getMissingRoles = (project) => {
  const requiredRoles = project.roles.map((projectRole) => projectRole.role);

  const filledRoles = project.members
    .map((member) => member.role)
    .filter((role) => role !== "Project Creator");

  return requiredRoles.filter(
    (requiredRole) => !filledRoles.includes(requiredRole)
  );
};

const getTeamRecommendations = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const projectId = Number(req.query.projectId);

    if (!projectId || Number.isNaN(projectId)) {
      return res.status(400).json({
        message: "A valid projectId is required",
      });
    }

    /*
      Load the project and everything Team Finder needs:
      - required roles
      - current team members
      - project creator
    */
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },

      include: {
        roles: true,

        members: {
          select: {
            userId: true,
            role: true,
            status: true,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    /*
      Only the project creator can currently
      use Team Finder for that project.
    */
    if (project.creatorId !== currentUserId) {
      return res.status(403).json({
        message: "You can only find teammates for your own projects",
      });
    }

    const missingRoles = getMissingRoles(project);

    /*
      If all required roles are already filled,
      there is no need to recommend anyone.
    */
    if (missingRoles.length === 0) {
      return res.status(200).json({
        project: {
          id: project.id,
          name: project.name,
          teamSize: project.teamSize,
          duration: project.duration,
        },

        missingRoles: [],

        recommendations: [],
      });
    }

    /*
      Get all students who have profiles.

      We exclude:
      1. The current user
      2. Students already in this project
    */
    const existingMemberIds = project.members.map(
      (member) => member.userId
    );

    const students = await prisma.user.findMany({
      where: {
        id: {
          notIn: [currentUserId, ...existingMemberIds],
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

    const recommendations = [];

    /*
      Evaluate every student against every missing role.
    */
    for (const student of students) {
      const profile = student.profile;

      const candidateSkills = normalizeList(profile.skills);
      const candidateInterests = normalizeList(profile.interests);

      const studentRoleMatches = [];

      for (const role of missingRoles) {
        const requiredSkills = getRoleSkills(role);

        const skillMatch = calculateSkillMatch(
          candidateSkills,
          requiredSkills
        );

        const interestMatch = calculateInterestMatch(
          candidateInterests,
          role
        );

        const availabilityMatch = calculateAvailabilityMatch(
          project.duration,
          profile.availability
        );

        /*
          Current v2 scoring:

          Skill match       → 70%
          Interest match    → 15%
          Availability      → 10%
          Experience        → 5%
        */
        const score =
          skillMatch.score * 70 +
          interestMatch * 15 +
          availabilityMatch * 10 +
          (profile.experience ? 5 : 0);

        const roundedScore = Math.round(score);

        const reasons = [];

        if (skillMatch.matchingSkills.length > 0) {
          reasons.push(
            `${skillMatch.matchingSkills.length} matching skill${
              skillMatch.matchingSkills.length > 1 ? "s" : ""
            }`
          );
        }

        if (interestMatch === 1) {
          reasons.push("Related interest");
        }

        if (availabilityMatch === 1) {
          reasons.push("Compatible availability");
        }

        if (profile.experience) {
          reasons.push("Has experience");
        }

        studentRoleMatches.push({
          role,
          matchScore: roundedScore,
          matchingSkills: skillMatch.matchingSkills,
          reasons,
        });
      }

      /*
        A student may match multiple roles.

        We keep their strongest role as their
        primary recommendation.
      */
      studentRoleMatches.sort(
        (a, b) => b.matchScore - a.matchScore
      );

      const bestRoleMatch = studentRoleMatches[0];

      if (!bestRoleMatch) {
        continue;
      }

      recommendations.push({
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

        recommendedRole: bestRoleMatch.role,

        matchScore: bestRoleMatch.matchScore,

        matchingSkills: bestRoleMatch.matchingSkills,

        reasons: bestRoleMatch.reasons,

        otherRoleMatches: studentRoleMatches.slice(1),
      });
    }

    /*
      Highest role match first.
    */
    recommendations.sort(
      (a, b) => b.matchScore - a.matchScore
    );

    res.status(200).json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        teamSize: project.teamSize,
        duration: project.duration,
      },

      missingRoles,

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