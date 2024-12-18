const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Route to get all players
router.get("/", async (req, res) => {
  try {
    const players = await pool.query(
      "SELECT id, name FROM players ORDER BY name ASC"
    );
    res.json(players.rows);
  } catch (err) {
    console.error("Error fetching players:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
