const express = require('express');
const router = express.Router();
const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Helper to save base64 files to public/uploads
const saveBase64File = (base64Data, originalName) => {
  if (typeof base64Data !== 'string') {
    return base64Data;
  }
  
  if (base64Data.startsWith('http') || base64Data.startsWith('/uploads')) {
    return base64Data;
  }

  let base64Content = base64Data;
  let ext = '.pdf'; // Default to pdf

  if (base64Data.startsWith('data:')) {
    const semicolonIdx = base64Data.indexOf(';base64,');
    if (semicolonIdx !== -1) {
      base64Content = base64Data.substring(semicolonIdx + 8);
      // Try to detect extension
      const mime = base64Data.substring(5, semicolonIdx);
      if (mime.includes('pdf')) ext = '.pdf';
      else if (mime.includes('word') || mime.includes('officedocument')) ext = '.docx';
      else if (mime.includes('image/png')) ext = '.png';
      else if (mime.includes('image/jpeg')) ext = '.jpg';
    }
  }

  if (originalName) {
    const origExt = path.extname(originalName);
    if (origExt) ext = origExt;
  }

  try {
    const buffer = Buffer.from(base64Content, 'base64');
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
    const uploadDir = path.join(__dirname, '../../public/uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueName);
    fs.writeFileSync(filePath, buffer);

    return `/uploads/${uniqueName}`;
  } catch (err) {
    console.error('Error in saveBase64File for careers:', err);
    return base64Data; // Fallback to storing raw base64 in LONGTEXT
  }
};

// POST /api/careers/apply - Public job application submission
router.post('/apply', async (req, res) => {
  try {
    const { full_name, email, phone, position, experience, message, resume_base64, resume_name } = req.body;

    if (!full_name || !email || !phone || !position || !experience) {
      return res.status(400).json({ error: 'Required fields: full_name, email, phone, position, experience' });
    }

    let resume_url = '';
    if (resume_base64) {
      resume_url = saveBase64File(resume_base64, resume_name);
    }

    const [result] = await db.query(
      `INSERT INTO job_applications (full_name, email, phone, position, experience, message, resume_url, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [full_name, email, phone, position, experience, message || '', resume_url]
    );

    res.status(201).json({ message: 'Application submitted successfully', applicationId: result.insertId });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Database error submitting application' });
  }
});

// GET /api/careers/applications - Retrieve all applications (Admin access)
router.get('/applications', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM job_applications ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Database error fetching applications' });
  }
});

// PUT /api/careers/applications/:id - Update application status (Admin access)
router.put('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const [result] = await db.query(
      'UPDATE job_applications SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Database error updating application status' });
  }
});

// DELETE /api/careers/applications/:id - Delete application (Admin access)
router.delete('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query('DELETE FROM job_applications WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Database error deleting application' });
  }
});

// GET /api/careers/openings - Public endpoint to retrieve active job openings
router.get('/openings', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM job_openings WHERE is_active = 1 ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching job openings:', error);
    res.status(500).json({ error: 'Database error fetching job openings' });
  }
});

// GET /api/careers/openings/all - Admin endpoint to retrieve all job openings
router.get('/openings/all', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM job_openings ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching all job openings:', error);
    res.status(500).json({ error: 'Database error fetching all job openings' });
  }
});

// POST /api/careers/openings - Admin endpoint to create a new job opening
router.post('/openings', async (req, res) => {
  try {
    const { title, department, location, experience, description, is_active } = req.body;

    if (!title || !department || !location || !experience || !description) {
      return res.status(400).json({ error: 'All fields are required: title, department, location, experience, description' });
    }

    const [result] = await db.query(
      `INSERT INTO job_openings (title, department, location, experience, description, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, department, location, experience, description, is_active === undefined ? 1 : is_active]
    );

    res.status(201).json({ message: 'Job opening created successfully', openingId: result.insertId });
  } catch (error) {
    console.error('Error creating job opening:', error);
    res.status(500).json({ error: 'Database error creating job opening' });
  }
});

// PUT /api/careers/openings/:id - Admin endpoint to update a job opening
router.put('/openings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, department, location, experience, description, is_active } = req.body;

    if (!title || !department || !location || !experience || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const [result] = await db.query(
      `UPDATE job_openings 
       SET title = ?, department = ?, location = ?, experience = ?, description = ?, is_active = ? 
       WHERE id = ?`,
      [title, department, location, experience, description, is_active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Job opening not found' });
    }

    res.json({ message: 'Job opening updated successfully' });
  } catch (error) {
    console.error('Error updating job opening:', error);
    res.status(500).json({ error: 'Database error updating job opening' });
  }
});

// DELETE /api/careers/openings/:id - Admin endpoint to delete a job opening
router.delete('/openings/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query('DELETE FROM job_openings WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Job opening not found' });
    }

    res.json({ message: 'Job opening deleted successfully' });
  } catch (error) {
    console.error('Error deleting job opening:', error);
    res.status(500).json({ error: 'Database error deleting job opening' });
  }
});

module.exports = router;
