const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const events = await pool.query(`
        SELECT id, date, course_name, major
        FROM events
        ORDER BY date DESC
      `);
    res.json(events.rows);
  } catch (err) {
    console.error("Error fetching events:", err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const eventDetails = await pool.query(
      `
        SELECT 
          p.name AS player_name, 
          ep.rank, 
          ep.money_won, 
          ep.total_points, 
          ep.ctps, 
          ep.skins
        FROM event_players ep
        JOIN players p ON ep.player_id = p.id
        WHERE ep.event_id = $1
        ORDER BY ep.rank ASC
      `,
      [id]
    );
    res.json(eventDetails.rows);
  } catch (err) {
    console.error("Error fetching event details:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
