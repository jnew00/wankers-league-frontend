const express = require("express");
const router = express.Router();
const pool = require("../../config/db");

// Get past events
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        e.id, 
        e.date, 
        e.is_major, 
        c.name AS course_name, 
        p.name AS winner_name
      FROM 
          events e
      JOIN 
          courses c ON e.course_id = c.id
      LEFT JOIN 
          event_players ep ON e.id = ep.event_id AND ep.rank = 1
      LEFT JOIN 
          players p ON ep.player_id = p.id
      ORDER BY 
          e.date DESC;
`
      // `
      //  SELECT
      //   e.id, e.date, e.is_major,
      //   c.name AS course_name, c.address AS course_address,
      //   COUNT(ep.player_id) AS player_count
      // FROM events e
      // JOIN courses c ON e.course_id = c.id
      // LEFT JOIN event_players ep ON e.id = ep.event_id
      // GROUP BY e.id, c.name, c.address
      // ORDER BY e.date DESC
      // `
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching past events:", error.message);
    res.status(500).send("Failed to fetch past events.");
  }
});

// Add a new event
router.post("/add-event", async (req, res) => {
  const { courseId, date, isMajor } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO events (course_id, date, is_major) VALUES ($1, $2, $3) RETURNING *`,
      [courseId, date, isMajor || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding event:", error.message);
    res.status(500).send("Failed to add event.");
  }
});

router.put("/:eventId/player/:playerId", async (req, res) => {
  const { eventId, playerId } = req.params;
  const { ctps, skins, moneyWon, rank, totalPoints, score } = req.body;

  try {
    const quotaResult = await pool.query(
      `SELECT current_quota FROM players WHERE id = $1`,
      [playerId]
    );

    const quota = quotaResult.rows[0].current_quota;

    const result = await pool.query(
      `
      INSERT INTO event_players (event_id, player_id, ctps, skins, money_won, rank, total_points, quota, score)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (event_id, player_id) DO UPDATE SET
        ctps = $3, skins = $4, money_won = $5, rank = $6, total_points = $7, score = $9
      RETURNING *
      `,
      [
        eventId,
        playerId,
        ctps,
        skins,
        moneyWon,
        rank,
        totalPoints,
        quota,
        score,
      ]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error saving player data:", error.message);
    res.status(500).send("Failed to save player data.");
  }
});

router.get("/:eventId", async (req, res) => {
  const { eventId } = req.params;

  try {
    const result = await pool.query(
      `
        SELECT e.id AS event_id, e.date, e.is_major, ep.player_id, 
          ep.rank, ep.ctps, ep.skins, ep.money_won, ep.total_points, ep.score, ep.quota,
          p.name AS player_name, p.image_path, p.current_quota
        FROM events e
        LEFT JOIN event_players ep ON e.id = ep.event_id
        LEFT JOIN players p ON ep.player_id = p.id
        WHERE e.id = $1

      `,
      [eventId]
    );
    console.log("Query Result:", result.rows);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching event data:", error.message);
    res.status(500).send("Failed to fetch event data.");
  }
});

// router.get("/:eventId", async (req, res) => {
//   const { eventId } = req.params;

//   try {
//     const eventDetailsQuery = await pool.query(
//       `
//       SELECT e.id, e.is_major, c.name AS course_name
//       FROM events e
//       JOIN courses c ON e.course_id = c.id
//       WHERE e.id = $1
//           `,
//       [eventId]
//     );

//     if (eventDetailsQuery.rows.length === 0) {
//       return res.status(404).json({ error: "Event not found" });
//     }

//     const eventDetails = eventDetailsQuery.rows[0];

//     // Fetch player-level details for the event
//     const playersQuery = await pool.query(
//       `
//          SELECT ep.player_id, p.name, ep.ctps, ep.skins, ep.money_won, ep.total_points, ep.rank
//          FROM event_players ep
//          JOIN players p ON ep.player_id = p.id
//          WHERE ep.event_id = $1
//       `,
//       [eventId]
//     );
//     res.status(200).json({
//       event: eventDetails.rows[0],
//       players: players.rows,
//     });
//   } catch (error) {
//     console.error("Error fetching event data:", error.message);
//     res.status(500).send("Failed to fetch event data.");
//   }
// });
router.put("/:eventId", async (req, res) => {
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

router.delete("/:eventId/player/:playerId", async (req, res) => {
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

module.exports = router;
