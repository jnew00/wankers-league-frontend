const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const quotas = await pool.query(`
        SELECT 
        p.id AS player_id,
        p.name AS player_name,
        COALESCE(MAX(ep.quota), 0) AS current_quota,
        COALESCE(
            LAG(MAX(ep.quota)) OVER (PARTITION BY p.id ORDER BY MAX(e.date) DESC), 
            0
        ) AS previous_quota,
        COALESCE(MAX(ep.score), 0) AS best_season_score,
        COALESCE(AVG(ep.score), 0) AS season_average
        FROM players p
        LEFT JOIN event_players ep ON p.id = ep.player_id
        LEFT JOIN events e ON ep.event_id = e.id
        WHERE e.date BETWEEN '2024-01-01' AND '2024-12-31'
        GROUP BY p.id, p.name
        ORDER BY p.name;
      `);

    res.json(quotas.rows);
  } catch (error) {
    console.error("Error fetching quotas:", error.message);
    res.status(500).send("Failed to fetch quotas.");
  }
});

module.exports = router;
