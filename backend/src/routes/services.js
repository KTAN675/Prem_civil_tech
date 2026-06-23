const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/services - Get all services ordered by order_index
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM services ORDER BY order_index ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Database error fetching services' });
  }
});

module.exports = router;
