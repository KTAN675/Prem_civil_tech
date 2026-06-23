const express = require('express');
const router = express.Router();
const db = require('../config/db');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    // Support both standard username and email format (admin@premcivil.com -> admin)
    let usernameInput = email;
    if (email.includes('@')) {
      usernameInput = email.split('@')[0];
    }

    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [usernameInput]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const hashed = hashPassword(password);
    if (user.password_hash !== hashed) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return session token and details
    res.json({
      success: true,
      token: `sess-token-${user.id}-${Date.now()}`,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

module.exports = router;
