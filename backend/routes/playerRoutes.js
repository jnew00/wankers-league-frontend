const express = require("express");
const router = express.Router(); // Initialize the router
const pool = require("../config/db"); // Import database connection

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch player details
    const playerDetails = await pool.query(
      `SELECT p.id, p.name, p.image_path, p.email, p.phone_number, p.current_quota
         FROM players p
         WHERE p.id = $1`,
      [id]
    );

    // Fetch current season stats
    const currentSeasonStats = await pool.query(
      `SELECT 
          COUNT(*) AS events_played,
          SUM(sp.money_won) AS total_money_won,
          SUM(sp.ctps) AS total_ctps,
          SUM(sp.skins) AS total_skins,
          SUM(CASE WHEN sp.placed_points > 0 THEN 1 ELSE 0 END) AS total_places
         FROM season_points sp
         WHERE sp.player_id = $1 AND sp.season = '2024'`,
      [id]
    );

    const rankResult = await pool.query(
      `SELECT COUNT(*) + 1 AS rank
         FROM players p
         JOIN season_points sp ON p.id = sp.player_id
         WHERE sp.total_points > (
           SELECT total_points FROM season_points WHERE player_id = $1 AND season = '2024'
         )`,
      [id]
    );
    const rank = rankResult.rows[0]?.rank || "N/A";

    // Fetch historical stats (all seasons)
    const historicalStats = await pool.query(
      `SELECT 
          COUNT(*) AS events_played,
          SUM(sp.money_won) AS total_money_won,
          SUM(sp.ctps) AS total_ctps,
          SUM(sp.skins) AS total_skins,
          SUM(CASE WHEN sp.placed_points > 0 THEN 1 ELSE 0 END) AS total_places
         FROM season_points sp
         WHERE sp.player_id = $1`,
      [id]
    );

    res.json({
      ...playerDetails.rows[0],
      currentSeasonStats: currentSeasonStats.rows[0],
      historicalStats: historicalStats.rows[0],
      rank,
    });
  } catch (err) {
    console.error("Error fetching player stats:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
