const express = require("express");
const router = express.Router();
const pool = require("../../config/db");

// Get all courses
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM courses ORDER BY name ASC");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching courses:", error.message);
    res.status(500).send("Failed to fetch courses.");
  }
});

// Delete a course by ID
router.delete("/:id", async (req, res) => {
  const courseId = req.params.id;

  try {
    // Check if the course is referenced in any events
    const eventCheck = await pool.query(
      `SELECT COUNT(*) FROM events WHERE course_id = $1`,
      [courseId]
    );

    if (parseInt(eventCheck.rows[0].count) > 0) {
      return res
        .status(400)
        .send("Cannot delete course: It is linked to events.");
    }

    // Delete the course
    await pool.query(`DELETE FROM courses WHERE id = $1`, [courseId]);

    res.status(200).send("Course deleted successfully.");
  } catch (error) {
    console.error("Error deleting course:", error.message);
    res.status(500).send("Failed to delete course.");
  }
});

// Search courses
router.get("/search", async (req, res) => {
  const { query } = req.query;
  try {
    const result = await pool.query(
      "SELECT id, name, address, front_tee, back_tee, website FROM courses WHERE LOWER(name) LIKE LOWER($1) ORDER BY name ASC LIMIT 10",
      [`%${query}%`]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error searching courses:", error.message);
    res.status(500).send("Failed to search courses.");
  }
});

// Add or update a course
router.post("/add-course", async (req, res) => {
  const { name, address, frontTee, backTee, website, scorecard, imagePath } =
    req.body;

  try {
    const result = await pool.query(
      `INSERT INTO courses (name, address, front_tee, back_tee, website, scorecard, image_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (name) DO UPDATE SET
       address = $2, front_tee = $3, back_tee = $4, website = $5, scorecard = $6, image_path = $7
       RETURNING *`,
      [
        name,
        address,
        frontTee,
        backTee,
        website,
        JSON.stringify(scorecard),
        imagePath,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding/updating course:", error.message);
    res.status(500).send("Failed to add/update course.");
  }
});

module.exports = router;
