const express = require('express');
const router = express.Router();
const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Auto-migration: Create blog_posts table if it doesn't exist
db.query(`
  CREATE TABLE IF NOT EXISTS blog_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    category VARCHAR(100) DEFAULT NULL,
    tags TEXT DEFAULT NULL,
    author VARCHAR(100) DEFAULT 'Admin',
    status VARCHAR(20) DEFAULT 'Draft',
    image_url VARCHAR(500) DEFAULT NULL,
    meta_description TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB;
`)
  .then(() => console.log('Successfully verified blog_posts table exists.'))
  .catch((err) => console.error('Error verifying/creating blog_posts table:', err));

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
    console.error('Error in saveBase64File for blog:', err);
    return base64Data;
  }
};

// GET /api/blog - Fetch all blog posts
// Query parameter: `status` (e.g. `Published` for frontend, default is all for admin)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM blog_posts';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Database error fetching blog posts' });
  }
});

// GET /api/blog/:id - Fetch a single blog post
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM blog_posts WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Database error fetching blog post' });
  }
});

// POST /api/blog - Create a new blog post
router.post('/', async (req, res) => {
  try {
    const { title, content, category, tags, author, status, image_url, meta_description } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    let finalImageUrl = null;
    if (image_url) {
      finalImageUrl = saveBase64File(image_url, `${title.replace(/\s+/g, '_')}_blog.png`);
    }

    const [result] = await db.query(
      `INSERT INTO blog_posts (title, content, category, tags, author, status, image_url, meta_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        content,
        category || 'General',
        tags || '',
        author || 'Admin',
        status || 'Draft',
        finalImageUrl,
        meta_description || ''
      ]
    );

    res.status(201).json({
      message: 'Blog post created successfully.',
      postId: result.insertId,
      image_url: finalImageUrl
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: 'Database error creating blog post' });
  }
});

// PUT /api/blog/:id - Update an existing blog post
router.put('/:id', async (req, res) => {
  try {
    const { title, content, category, tags, author, status, image_url, meta_description } = req.body;

    const [existing] = await db.query('SELECT * FROM blog_posts WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    const current = existing[0];
    const final_title = title !== undefined ? title : current.title;
    const final_content = content !== undefined ? content : current.content;
    const final_category = category !== undefined ? category : current.category;
    const final_tags = tags !== undefined ? tags : current.tags;
    const final_author = author !== undefined ? author : current.author;
    const final_status = status !== undefined ? status : current.status;
    const final_meta_description = meta_description !== undefined ? meta_description : current.meta_description;

    let final_image_url = current.image_url;
    if (image_url !== undefined) {
      if (image_url === null) {
        final_image_url = null;
      } else {
        final_image_url = saveBase64File(image_url, `${final_title.replace(/\s+/g, '_')}_blog.png`);
      }
    }

    await db.query(
      `UPDATE blog_posts 
       SET title = ?, content = ?, category = ?, tags = ?, author = ?, status = ?, image_url = ?, meta_description = ? 
       WHERE id = ?`,
      [
        final_title,
        final_content,
        final_category,
        final_tags,
        final_author,
        final_status,
        final_image_url,
        final_meta_description,
        req.params.id
      ]
    );

    res.json({
      message: 'Blog post updated successfully',
      image_url: final_image_url
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Database error updating blog post' });
  }
});

// DELETE /api/blog/:id - Delete a blog post
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM blog_posts WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Database error deleting blog post' });
  }
});

module.exports = router;
