const express = require('express');
const router = express.Router();
const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Run a query to add avatar_url if it doesn't exist
db.query("SHOW COLUMNS FROM testimonials LIKE 'avatar_url'")
  .then(([cols]) => {
    if (cols.length === 0) {
      db.query("ALTER TABLE testimonials ADD COLUMN avatar_url VARCHAR(500) DEFAULT NULL")
        .then(() => console.log("Added avatar_url column to testimonials table."))
        .catch(err => console.error("Error adding avatar_url column:", err));
    }
  })
  .catch(err => console.error("Error checking for avatar_url column:", err));

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
    console.error('Error in saveBase64File for testimonials:', err);
    return base64Data;
  }
};

// GET /api/testimonials - Get all approved testimonials (Public)
// Can pass query parameter `all=true` (Admin) to get both approved and pending
router.get('/', async (req, res) => {
  try {
    const { all } = req.query;
    let query = 'SELECT * FROM testimonials';
    const params = [];

    if (all !== 'true') {
      query += ' WHERE is_approved = 1';
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ error: 'Database error fetching testimonials' });
  }
});

// POST /api/testimonials - Submit a new testimonial
router.post('/', async (req, res) => {
  try {
    const { client_name, company, designation, quote, rating, is_approved, avatar_url } = req.body;
    if (!client_name || !quote) {
      return res.status(400).json({ error: 'Client name and quote are required' });
    }

    let finalAvatarUrl = null;
    if (avatar_url) {
      finalAvatarUrl = saveBase64File(avatar_url, `${client_name.replace(/\s+/g, '_')}_avatar.png`);
    }

    const approvedStatus = is_approved !== undefined ? (is_approved ? 1 : 0) : 0;

    const [result] = await db.query(
      `INSERT INTO testimonials (client_name, company, designation, quote, rating, is_approved, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [client_name, company || null, designation || null, quote, rating || 5, approvedStatus, finalAvatarUrl]
    );

    res.status(201).json({
      message: 'Testimonial created successfully.',
      testimonialId: result.insertId,
      avatar_url: finalAvatarUrl
    });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ error: 'Database error creating testimonial' });
  }
});

// PUT /api/testimonials/:id - Update testimonial (Admin)
router.put('/:id', async (req, res) => {
  try {
    const { client_name, company, designation, quote, rating, is_approved, avatar_url } = req.body;
    
    // Check if the testimonial exists first
    const [existing] = await db.query('SELECT * FROM testimonials WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    const current = existing[0];
    const final_client_name = client_name !== undefined ? client_name : current.client_name;
    const final_company = company !== undefined ? company : current.company;
    const final_designation = designation !== undefined ? designation : current.designation;
    const final_quote = quote !== undefined ? quote : current.quote;
    const final_rating = rating !== undefined ? rating : current.rating;
    const final_is_approved = is_approved !== undefined ? (is_approved ? 1 : 0) : current.is_approved;
    
    let final_avatar_url = current.avatar_url;
    if (avatar_url !== undefined) {
      if (avatar_url === null) {
        final_avatar_url = null;
      } else {
        final_avatar_url = saveBase64File(avatar_url, `${final_client_name.replace(/\s+/g, '_')}_avatar.png`);
      }
    }

    await db.query(
      `UPDATE testimonials 
       SET client_name = ?, company = ?, designation = ?, quote = ?, rating = ?, is_approved = ?, avatar_url = ? 
       WHERE id = ?`,
      [final_client_name, final_company, final_designation, final_quote, final_rating, final_is_approved, final_avatar_url, req.params.id]
    );

    res.json({ message: 'Testimonial updated successfully' });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ error: 'Database error updating testimonial' });
  }
});

// DELETE /api/testimonials/:id - Delete a testimonial (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ error: 'Database error deleting testimonial' });
  }
});

module.exports = router;
