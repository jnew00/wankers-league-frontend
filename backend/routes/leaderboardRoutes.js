const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Fetch leaderboard data
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.image_path,
        p.current_quota,
        sp.money_won,
        sp.participation_points,
        sp.skins,
        sp.placed_points,
        sp.total_points
      FROM players p
      JOIN season_points sp ON p.id = sp.player_id
      WHERE sp.season = '2024'
      ORDER BY sp.total_points DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching leaderboard:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
