const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        p.id, 
        p.name, 
        p.current_quota, 
        p.image_path, 
        p.email, 
        p.phone_number
      FROM players p
      ORDER BY p.name ASC
      `
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching players:", error.message);
    res.status(500).send("Failed to fetch players.");
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Query to fetch player information
    const playerQuery = `
      SELECT 
        p.id, 
        p.name, 
        p.email, 
        p.phone_number, 
        p.image_path, 
        (SELECT COUNT(DISTINCT ep.event_id)
         FROM event_players ep
         WHERE ep.player_id = p.id) AS events_played,
        (SELECT SUM(ep.money_won) FROM event_players ep WHERE ep.player_id = p.id) AS total_money_won,
        (SELECT SUM(ep.ctps) FROM event_players ep WHERE ep.player_id = p.id) AS total_ctps,
        (SELECT SUM(ep.skins) FROM event_players ep WHERE ep.player_id = p.id) AS total_skins
      FROM players p
      WHERE p.id = $1;
    `;

    const { rows } = await pool.query(playerQuery, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Player not found" });
    }

    const player = rows[0];

    // Response matching the frontend structure
    const response = {
      id: player.id,
      name: player.name,
      email: player.email,
      phone_number: player.phone_number,
      image_path: player.image_path,
      currentSeasonStats: {
        events_played: player.events_played || 0,
        total_money_won: player.total_money_won || 0,
        total_ctps: player.total_ctps || 0,
        total_skins: player.total_skins || 0,
      },
      historicalStats: {
        // Placeholder for historical stats (implement as needed)
        events_played: 0,
        total_money_won: 0,
        total_ctps: 0,
        total_skins: 0,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching player details:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
