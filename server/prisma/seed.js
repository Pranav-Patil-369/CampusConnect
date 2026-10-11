const prisma = require("../src/lib/prisma");

async function main() {
  await prisma.opportunity.deleteMany();

  await prisma.opportunity.createMany({
    data: [
      {
        title: "Campus Hackathon 2026",
        description:
          "A student-focused hackathon where participants build innovative solutions to real-world problems.",
        type: "Hackathon",
        organization: "CampusConnect Events",
        deadline: new Date("2026-11-15"),
        link: "https://example.com/hackathon",
      },
      {
        title: "AI/ML Internship",
        description:
          "An internship opportunity for students interested in artificial intelligence and machine learning.",
        type: "Internship",
        organization: "Tech Innovations",
        deadline: new Date("2026-11-30"),
        link: "https://example.com/internship",
      },
      {
        title: "React Development Workshop",
        description:
          "A practical workshop covering React fundamentals, component design, and modern frontend development.",
        type: "Workshop",
        organization: "Developer Community",
        deadline: new Date("2026-12-05"),
        link: "https://example.com/workshop",
      },
      {
        title: "Student Innovation Competition",
        description:
          "Showcase your project idea and compete with other students for recognition and prizes.",
        type: "Competition",
        organization: "Innovation Hub",
        deadline: new Date("2026-12-20"),
        link: "https://example.com/competition",
      },
    ],
  });

  console.log("Opportunities seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });