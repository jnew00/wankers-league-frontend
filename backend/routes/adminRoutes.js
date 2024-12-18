const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// Post event results and update quotas
router.post('/post-event', async (req, res) => {
    const { results } = req.body;
    try {
        // Loop through results to update scores and quotas
        for (let result of results) {
            const { player_id, points, previous_quota } = result;
            let newQuota = previous_quota;
            if (points >= previous_quota + 2) {
                newQuota = previous_quota + Math.ceil((points - previous_quota) / 2);
            } else if (points <= previous_quota - 3) {
                newQuota = previous_quota - 2;
            }
            await pool.query(
                `UPDATE players SET quota = $1 WHERE id = $2`,
                [newQuota, player_id]
            );
        }
        res.status(200).send("Event posted and quotas updated.");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
