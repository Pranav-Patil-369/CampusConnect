const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const discoverRoutes = require("./routes/discover.routes");
const publicProfileRoutes = require("./routes/public-profile.routes");
const teamFinderRoutes = require("./routes/team-finder.routes");
const projectRoutes = require("./routes/project.routes");
const invitationRoutes = require("./routes/invitation.routes");
const taskRoutes = require("./routes/task.routes");
const opportunityRoutes = require("./routes/opportunity.routes");
const searchRoutes = require("./routes/search.routes");
const notificationRoutes = require("./routes/notification.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/discover", discoverRoutes);
app.use("/api/public-profile", publicProfileRoutes);
app.use("/api/team-finder", teamFinderRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "CampusConnect API is running 🚀"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});