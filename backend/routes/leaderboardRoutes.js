const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
          p.id AS player_id,
          p.name,
          p.image_path,
          p.current_quota,
          COALESCE(SUM(ep.money_won), 0) AS money_won,
          COALESCE(SUM(ep.skins), 0) AS skins,
          COALESCE(SUM(ep.ctps), 0) AS ctps,
          COUNT(CASE WHEN ep.rank = 1 THEN 1 END) AS wins,
          COUNT(CASE WHEN ep.rank <= 3 THEN 1 END) AS top_3,
          COUNT(DISTINCT ep.event_id) AS events_played,
          COALESCE(SUM(ep.total_points), 0) AS total_points
      FROM 
          players p
      LEFT JOIN 
          event_players ep ON p.id = ep.player_id
      GROUP BY 
          p.id, p.name, p.image_path, p.current_quota
      ORDER BY 
          total_points DESC;
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching leaderboard:", error.message);
    res.status(500).send("Failed to fetch leaderboard.");
  }
});

module.exports = router;
