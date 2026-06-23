const express = require('express');
const router = express.Router();
const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Helper to save base64 files to public/uploads
const saveBase64File = (base64Data, fileName) => {
  if (typeof base64Data !== 'string') {
    return base64Data;
  }
  
  if (base64Data.startsWith('http') || base64Data.startsWith('/uploads')) {
    return base64Data;
  }

  let base64Content = base64Data;
  if (base64Data.startsWith('data:')) {
    const semicolonIdx = base64Data.indexOf(';base64,');
    if (semicolonIdx !== -1) {
      base64Content = base64Data.substring(semicolonIdx + 8);
    }
  }

  // If it's not actually base64 but just a regular string, don't write it
  if (!base64Content || base64Content.length < 20 || base64Content.includes(' ') || base64Content.includes('\n')) {
    return base64Data;
  }

  try {
    const buffer = Buffer.from(base64Content, 'base64');
    const ext = path.extname(fileName) || '.png';
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
    const uploadDir = path.join(__dirname, '../../public/uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueName);
    fs.writeFileSync(filePath, buffer);

    return `/uploads/${uniqueName}`;
  } catch (err) {
    console.error('Error in saveBase64File for team:', err);
    return base64Data;
  }
};

// GET /api/team - Fetch all team members
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM team_members ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Database error fetching team members' });
  }
});

// POST /api/team - Add a new team member
router.post('/', async (req, res) => {
  try {
    let { name, role, image_url, bio } = req.body;
    if (!name || !role) {
      return res.status(400).json({ error: 'Name and role are required' });
    }

    if (image_url) {
      image_url = saveBase64File(image_url, `${name.replace(/\s+/g, '_').toLowerCase()}.png`);
    }

    const [result] = await db.query(
      'INSERT INTO team_members (name, role, image_url, bio) VALUES (?, ?, ?, ?)',
      [name, role, image_url || null, bio || null]
    );

    res.status(201).json({
      message: 'Team member added successfully',
      memberId: result.insertId,
      image_url: image_url
    });
  } catch (error) {
    console.error('Error creating team member:', error);
    res.status(500).json({ error: 'Database error creating team member' });
  }
});

// PUT /api/team/:id - Update an existing team member
router.put('/:id', async (req, res) => {
  try {
    let { name, role, image_url, bio } = req.body;
    if (!name || !role) {
      return res.status(400).json({ error: 'Name and role are required' });
    }

    if (image_url) {
      image_url = saveBase64File(image_url, `${name.replace(/\s+/g, '_').toLowerCase()}.png`);
    }

    const [result] = await db.query(
      'UPDATE team_members SET name = ?, role = ?, image_url = ?, bio = ? WHERE id = ?',
      [name, role, image_url || null, bio || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    res.json({ message: 'Team member updated successfully', image_url: image_url });
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ error: 'Database error updating team member' });
  }
});

// DELETE /api/team/:id - Delete a team member
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM team_members WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ error: 'Database error deleting team member' });
  }
});

module.exports = router;
