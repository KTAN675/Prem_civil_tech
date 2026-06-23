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
    console.error('Error in saveBase64File for gallery:', err);
    return base64Data;
  }
};

// GET /api/gallery - Fetch all gallery items
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM gallery_items ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    res.status(500).json({ error: 'Database error fetching gallery' });
  }
});

// POST /api/gallery - Add new gallery item
router.post('/', async (req, res) => {
  try {
    let { title, image_url, category } = req.body;
    if (!image_url) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Save base64 image if uploaded as file
    image_url = saveBase64File(image_url, title ? `${title.replace(/\s+/g, '_').toLowerCase()}.png` : 'gallery.png');

    const [result] = await db.query(
      'INSERT INTO gallery_items (title, image_url, category) VALUES (?, ?, ?)',
      [title || null, image_url, category || 'General']
    );

    res.status(201).json({
      message: 'Gallery item added successfully',
      itemId: result.insertId,
      image_url: image_url
    });
  } catch (error) {
    console.error('Error creating gallery item:', error);
    res.status(500).json({ error: 'Database error creating gallery item' });
  }
});

// PUT /api/gallery/:id - Update gallery item
router.put('/:id', async (req, res) => {
  try {
    const { title, category } = req.body;
    const [result] = await db.query(
      'UPDATE gallery_items SET title = ?, category = ? WHERE id = ?',
      [title || null, category || 'General', req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Gallery item updated successfully' });
  } catch (error) {
    console.error('Error updating gallery item:', error);
    res.status(500).json({ error: 'Database error updating gallery item' });
  }
});

// DELETE /api/gallery/:id - Delete gallery item
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM gallery_items WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(500).json({ error: 'Database error deleting gallery item' });
  }
});

module.exports = router;
