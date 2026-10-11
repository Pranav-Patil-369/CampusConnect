const prisma = require("../lib/prisma");

const getOpportunities = async (req, res) => {
  try {
    const opportunities = await prisma.opportunity.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      opportunities,
    });
  } catch (error) {
    console.error("Get opportunities error:", error);

    res.status(500).json({
      message: "Failed to get opportunities",
    });
  }
};

const getOpportunityById = async (req, res) => {
  try {
    const opportunityId = Number(req.params.id);

    if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
      return res.status(400).json({
        message: "Invalid opportunity ID",
      });
    }

    const opportunity = await prisma.opportunity.findUnique({
      where: {
        id: opportunityId,
      },
    });

    if (!opportunity) {
      return res.status(404).json({
        message: "Opportunity not found",
      });
    }

    res.status(200).json({
      opportunity,
    });
  } catch (error) {
    console.error("Get opportunity error:", error);

    res.status(500).json({
      message: "Failed to get opportunity",
    });
  }
};

module.exports = {
  getOpportunities,
  getOpportunityById,
};