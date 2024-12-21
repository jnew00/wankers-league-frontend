const express = require("express");
const router = express.Router();

// Use modular routes with prefixes
router.use("/courses", require("./admin/courseRoutes"));
router.use("/events", require("./admin/eventRoutes"));
// router.use("/players", require("./playersRoutes"));
router.use("/points", require("./admin/pointRoutes")); // Scoped at /api/admin/points

module.exports = router;
