const express = require("express");
const router = express.Router(); // Initialize the router
const pool = require("../config/db"); // Import database connection

// Fetch player details and stats
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch player details and total points
    const playerDetails = await pool.query(
      `SELECT p.id, p.name, p.image_path, p.email, p.phone_number, p.current_quota, sp.total_points
       FROM players p
       JOIN season_points sp ON p.id = sp.player_id
       WHERE p.id = $1 AND sp.season = '2024'`,
      [id]
    );

    // Fetch last 10 games for average quota calculation
    const last10Games = await pool.query(
      `SELECT quota
       FROM games_played
       WHERE player_id = $1
       ORDER BY game_date DESC
       LIMIT 10`,
      [id]
    );

    const quotas = last10Games.rows.map((game) => game.quota);
    const averageQuota =
      quotas.length > 0 ? quotas.reduce((a, b) => a + b, 0) / quotas.length : 0;

    // Fetch rank based on total points
    const rankResult = await pool.query(
      `SELECT COUNT(*) + 1 AS rank
       FROM players p
       JOIN season_points sp ON p.id = sp.player_id
       WHERE sp.total_points > (
         SELECT total_points FROM season_points WHERE player_id = $1 AND season = '2024'
       )`,
      [id]
    );

    const rank = rankResult.rows[0].rank;

    res.json({
      ...playerDetails.rows[0],
      averageQuota: Math.round(averageQuota),
      rank,
    });
  } catch (err) {
    console.error("Error fetching player details:", err.message);
    res.status(500).send("Server Error");
  }
});

// Export the router
module.exports = router;
