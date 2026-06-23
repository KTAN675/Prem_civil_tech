const express = require('express');
const router = express.Router();
const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Ensure commencement_date, executive_summary, and status columns exist in database
db.query('ALTER TABLE projects ADD COLUMN commencement_date DATE DEFAULT NULL').catch(() => {});
db.query('ALTER TABLE projects ADD COLUMN executive_summary TEXT DEFAULT NULL').catch(() => {});
db.query("ALTER TABLE projects ADD COLUMN status VARCHAR(20) DEFAULT 'Completed'").catch(() => {});

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
    console.error('Error in saveBase64File:', err);
    return base64Data;
  }
};

// GET /api/projects - Get all projects
router.get('/', async (req, res) => {
  try {
    const { category, featured } = req.query;
    let query = 'SELECT * FROM projects';
    const params = [];

    if (featured === 'true') {
      query += ' WHERE is_featured = 1';
    }

    if (category) {
      query += featured === 'true' ? ' AND category = ?' : ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Database error fetching projects' });
  }
});

// GET /api/projects/:id - Get single project
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Database error fetching project' });
  }
});

// POST /api/projects - Create a new project (Admin)
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      category, 
      client, 
      location, 
      year, 
      description, 
      thumbnail_url, 
      images, 
      is_featured, 
      status,
      commencement_date,
      executive_summary
    } = req.body;

    if (!title || !category || !thumbnail_url) {
      return res.status(400).json({ error: 'Title, category, and thumbnail_url are required' });
    }

    // Save thumbnail if base64
    let finalThumbnailUrl = thumbnail_url;
    if (thumbnail_url && thumbnail_url.startsWith('data:')) {
      try {
        finalThumbnailUrl = saveBase64File(thumbnail_url, 'thumbnail.png');
      } catch (err) {
        console.error('Failed to save project thumbnail:', err);
      }
    }

    // Save gallery images if base64
    let finalImagesVal = null;
    if (images) {
      let parsedImages = images;
      if (typeof images === 'string') {
        try {
          parsedImages = JSON.parse(images);
        } catch (e) {
          parsedImages = [images];
        }
      }
      const savedImageUrls = [];
      if (Array.isArray(parsedImages)) {
        for (const imgObj of parsedImages) {
          if (typeof imgObj === 'string') {
            if (imgObj.startsWith('data:')) {
              try {
                const url = saveBase64File(imgObj, 'project_image.png');
                savedImageUrls.push(url);
              } catch (err) {
                console.error('Failed to save project image:', err);
              }
            } else {
              savedImageUrls.push(imgObj);
            }
          } else if (imgObj && imgObj.data) {
            try {
              const url = saveBase64File(imgObj.data, imgObj.name || 'project_image.png');
              savedImageUrls.push(url);
            } catch (err) {
              console.error('Failed to save project image from object:', err);
            }
          } else if (typeof imgObj === 'object' && imgObj.url) {
            savedImageUrls.push(imgObj.url);
          }
        }
      }
      finalImagesVal = JSON.stringify(savedImageUrls);
    }

    const [result] = await db.query(
      `INSERT INTO projects (title, category, client, location, year, description, thumbnail_url, images, is_featured, status, commencement_date, executive_summary) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, 
        category, 
        client || null, 
        location || null, 
        year ? parseInt(year, 10) : null, 
        description || null, 
        finalThumbnailUrl, 
        finalImagesVal, 
        is_featured ? 1 : 0, 
        status || 'Completed',
        commencement_date || null,
        executive_summary || null
      ]
    );

    res.status(201).json({
      message: 'Project created successfully',
      projectId: result.insertId
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Database error creating project' });
  }
});

// PUT /api/projects/:id - Update an existing project (Admin)
router.put('/:id', async (req, res) => {
  try {
    const { 
      title, 
      category, 
      client, 
      location, 
      year, 
      description, 
      thumbnail_url, 
      images, 
      is_featured, 
      status,
      commencement_date,
      executive_summary
    } = req.body;

    if (!title || !category || !thumbnail_url) {
      return res.status(400).json({ error: 'Title, category, and thumbnail_url are required' });
    }

    // Save thumbnail if base64
    let finalThumbnailUrl = thumbnail_url;
    if (thumbnail_url && thumbnail_url.startsWith('data:')) {
      try {
        finalThumbnailUrl = saveBase64File(thumbnail_url, 'thumbnail.png');
      } catch (err) {
        console.error('Failed to save project thumbnail:', err);
      }
    }

    // Save gallery images if base64
    let finalImagesVal = null;
    if (images) {
      let parsedImages = images;
      if (typeof images === 'string') {
        try {
          parsedImages = JSON.parse(images);
        } catch (e) {
          parsedImages = [images];
        }
      }
      const savedImageUrls = [];
      if (Array.isArray(parsedImages)) {
        for (const imgObj of parsedImages) {
          if (typeof imgObj === 'string') {
            if (imgObj.startsWith('data:')) {
              try {
                const url = saveBase64File(imgObj, 'project_image.png');
                savedImageUrls.push(url);
              } catch (err) {
                console.error('Failed to save project image:', err);
              }
            } else {
              savedImageUrls.push(imgObj);
            }
          } else if (imgObj && imgObj.data) {
            try {
              const url = saveBase64File(imgObj.data, imgObj.name || 'project_image.png');
              savedImageUrls.push(url);
            } catch (err) {
              console.error('Failed to save project image from object:', err);
            }
          } else if (typeof imgObj === 'object' && imgObj.url) {
            savedImageUrls.push(imgObj.url);
          }
        }
      }
      finalImagesVal = JSON.stringify(savedImageUrls);
    }

    const [result] = await db.query(
      `UPDATE projects SET title = ?, category = ?, client = ?, location = ?, year = ?, description = ?, thumbnail_url = ?, images = ?, is_featured = ?, status = ?, commencement_date = ?, executive_summary = ?
       WHERE id = ?`,
      [
        title, 
        category, 
        client || null, 
        location || null, 
        year ? parseInt(year, 10) : null, 
        description || null, 
        finalThumbnailUrl, 
        finalImagesVal, 
        is_featured ? 1 : 0, 
        status || 'Completed',
        commencement_date || null,
        executive_summary || null,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Database error updating project' });
  }
});

// DELETE /api/projects/:id - Delete a project (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Database error deleting project' });
  }
});

module.exports = router;
