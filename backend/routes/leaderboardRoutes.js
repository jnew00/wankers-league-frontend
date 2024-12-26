const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
          RANK() OVER (ORDER BY COALESCE(SUM(ep.total_points), 0) DESC) AS rank,
          p.id AS player_id,
          p.name,
          p.image_path,
          p.current_quota,
          p.email,
          p.phone_number,
          p.image_path,
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

    const latestUpdateResult = await pool.query(`
      SELECT MAX(created_at) AS latest_update FROM event_players;
    `);

    const latestUpdate = latestUpdateResult.rows[0]?.latest_update;

    res.status(200).json({
      leaderboard: result.rows,
      latest_update: latestUpdate,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error.message);
    res.status(500).send("Failed to fetch leaderboard.");
  }
});

module.exports = router;
