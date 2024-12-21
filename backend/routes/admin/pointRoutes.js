const express = require("express");
const router = express.Router();
const pool = require("../../config/db");

router.get("/config", async (req, res) => {
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

router.put("/config", async (req, res) => {
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
module.exports = router;
