const express = require("express");
const pool = require("../config/db");
const router = express.Router();

router.get("/points-config", async (req, res) => {
  try {
    const config = await pool.query(
      "SELECT key, value FROM points_config ORDER BY value DESC"
    );
    res.json(config.rows);
  } catch (err) {
    console.error("Error fetching points configuration:", err.message);
    res.status(500).send("Server Error");
  }
});

router.put("/event/:eventId/player/:playerId", async (req, res) => {
  const { eventId, playerId } = req.params;
  const { ctps, skins, money_won, total_points, rank } = req.body;

  try {
    const playerIdInt = parseInt(playerId, 10);
    const eventIdInt = parseInt(eventId, 10);

    if (isNaN(playerIdInt) || isNaN(eventIdInt)) {
      return res.status(400).send("Invalid playerId or eventId.");
    }

    await pool.query(
      `
        INSERT INTO event_players (event_id, player_id, ctps, skins, money_won, total_points, rank)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (event_id, player_id)
        DO UPDATE SET 
          ctps = EXCLUDED.ctps,
          skins = EXCLUDED.skins,
          money_won = EXCLUDED.money_won,
          total_points = EXCLUDED.total_points,
          rank = EXCLUDED.rank
        `,
      [
        eventId,
        playerId,
        ctps || 0,
        skins || 0,
        money_won || 0,
        total_points || 0,
        rank || null,
      ]
    );
    res.status(200).send("Player saved successfully!");
  } catch (error) {
    console.error("Error saving player:", error.message);
    res.status(500).send("Error saving player");
  }
});

router.get("/event/:eventId", async (req, res) => {
  const { eventId } = req.params;

  try {
    // Fetch event-level details including the major flag
    const eventDetailsQuery = await pool.query(
      `
          SELECT id, major
          FROM events
          WHERE id = $1
        `,
      [eventId]
    );

    if (eventDetailsQuery.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const eventDetails = eventDetailsQuery.rows[0];

    // Fetch player-level details for the event
    const playersQuery = await pool.query(
      `
          SELECT ep.player_id, p.name, ep.ctps, ep.skins, ep.rank, ep.money_won, ep.total_points
          FROM event_players ep
          JOIN players p ON ep.player_id = p.id
          WHERE ep.event_id = $1
        `,
      [eventId]
    );

    res.status(200).json({
      id: eventDetails.id,
      is_major: eventDetails.major,
      players: playersQuery.rows,
    });
  } catch (error) {
    console.error("Error fetching event data:", error.message);
    res.status(500).send("Failed to fetch event data.");
  }
});

router.put("/event/:eventId", async (req, res) => {
  const { eventId } = req.params;
  const { players } = req.body;

  try {
    // Update each player's data
    for (const player of players) {
      await pool.query(
        `UPDATE event_players
           SET ctps = $1,
               skins = $2,
               money_won = $3,
               total_points = $4,
               rank = $5
           WHERE event_id = $6 AND player_id = $7`,
        [
          player.ctps || 0,
          player.skins || 0,
          player.money_won || 0,
          player.total_points || 0,
          player.rank || null,
          eventId,
          player.player_id,
        ]
      );
    }

    res.status(200).send("Event players updated successfully.");
  } catch (err) {
    console.error("Error updating event players:", err.message);
    res.status(500).send("Failed to update event players.");
  }
});

router.delete("/event/:eventId/player/:playerId", async (req, res) => {
  const { eventId, playerId } = req.params;
  try {
    await pool.query(
      "DELETE FROM event_players WHERE event_id = $1 AND player_id = $2",
      [eventId, playerId]
    );
    res.status(200).json({ message: "Player deleted successfully" });
  } catch (err) {
    console.error("Error deleting player:", err.message);
    res.status(500).send("Server error");
  }
});

router.put("/points-config", async (req, res) => {
  const pointsConfig = req.body; // Expecting a JSON object of key-value pairs

  try {
    const queries = Object.entries(pointsConfig).map(([key, value]) =>
      pool.query(`UPDATE points_config SET value = $2 WHERE key = $1`, [
        key,
        value,
      ])
    );

    // Execute all queries
    await Promise.all(queries);

    res.status(200).send("Points configuration updated successfully.");
  } catch (error) {
    console.error("Error updating points configuration:", error.message);
    res.status(500).send("Error updating points configuration.");
  }
});

router.post("/save-event", async (req, res) => {
  const { eventId, players } = req.body;

  try {
    const client = await pool.connect();

    // Loop through players to insert or update their data
    for (const player of players) {
      await client.query(
        `
        INSERT INTO event_players (event_id, player_id, ctp, skin, place, money_won, points)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (event_id, player_id) -- Use the unique constraint
        DO UPDATE SET
          ctp = EXCLUDED.ctp,
          skin = EXCLUDED.skin,
          place = EXCLUDED.place,
          money_won = EXCLUDED.money_won,
          points = EXCLUDED.points;
        `,
        [
          eventId,
          player.id,
          player.ctp || 0,
          player.skin || 0,
          player.place || null,
          player.money_won || 0,
          player.points || 0,
        ]
      );
    }

    client.release();
    res.status(200).send("Event data saved successfully!");
  } catch (error) {
    console.error("Error saving event data:", error);
    res.status(500).send("Failed to save event data.");
  }
});

module.exports = router;
