const express = require("express");
const pool = require("../config/db");
const router = express.Router();

router.get("/points-config", async (req, res) => {
  try {
    const config = await pool.query("SELECT key, value FROM points_config");
    res.json(config.rows);
  } catch (err) {
    console.error("Error fetching points configuration:", err.message);
    res.status(500).send("Server Error");
  }
});

router.put("/points-config", async (req, res) => {
  const { key, value } = req.body;

  try {
    await pool.query("UPDATE points_config SET value = $1 WHERE key = $2", [
      value,
      key,
    ]);
    res.status(200).send("Points configuration updated.");
  } catch (err) {
    console.error("Error updating points configuration:", err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/save-event", async (req, res) => {
  const { eventId, players, pointsConfig } = req.body;

  try {
    // Insert or update players' event data
    for (const player of players) {
      await pool.query(
        `INSERT INTO event_players (event_id, player_id, rank, money_won, total_points, ctps, skins)
           VALUES ($1, (SELECT id FROM players WHERE name = $2), $3, $4, $5, $6, $7)
           ON CONFLICT (event_id, player_id) DO UPDATE SET
           rank = $3, money_won = $4, total_points = $5, ctps = $6, skins = $7`,
        [
          eventId,
          player.name,
          player.place,
          player.money_won,
          player.points,
          player.ctp ? 1 : 0,
          player.skin ? 1 : 0,
        ]
      );
    }

    res.status(200).send("Event data saved successfully.");
  } catch (err) {
    console.error("Error saving event data:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
