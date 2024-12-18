const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const quotaRoutes = require("./routes/quotaRoutes");
const adminRoutes = require("./routes/adminRoutes");
const playerRoutes = require("./routes/playerRoutes");
const pastEventsRoutes = require("./routes/pastEventsRoutes");

const app = express();

// Middleware
app.use(cors()); // Allow all origins for development
app.use(bodyParser.json());

// Routes
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/quotas", quotaRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/player", playerRoutes);
app.use("/api/past-events", pastEventsRoutes);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Server
const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
