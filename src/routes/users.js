const express = require('express');
const router = express.Router();
const db = require('../config/db');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// GET /api/users - Fetch all users (excluding hashes)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Database error fetching users' });
  }
});

// POST /api/users - Create new admin/editor user
router.post('/', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const hashed = hashPassword(password);
    const [result] = await db.query(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      [username, hashed, role || 'editor']
    );

    res.status(201).json({
      message: 'User created successfully',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Database error creating user' });
  }
});

// DELETE /api/users/:id - Delete a user
router.delete('/:id', async (req, res) => {
  try {
    // Prevent deleting the main 'admin' account
    const [userRows] = await db.query('SELECT username FROM users WHERE id = ?', [req.params.id]);
    if (userRows.length > 0 && userRows[0].username === 'admin') {
      return res.status(403).json({ error: 'The primary admin account cannot be deleted' });
    }

    const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Database error deleting user' });
  }
});

module.exports = router;
