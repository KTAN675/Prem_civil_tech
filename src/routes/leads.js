const express = require('express');
const router = express.Router();
const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Ensure attachment_url column exists in database
db.query('ALTER TABLE leads_quotes ADD COLUMN attachment_url TEXT DEFAULT NULL').catch(() => {
  // Ignore error if column already exists
});

// Helper to save base64 files to public/uploads
const saveBase64File = (base64Data, fileName) => {
  let base64Content = base64Data;
  
  // If it is a data URL, extract the raw base64 data portion
  if (base64Data.startsWith('data:')) {
    const semicolonIdx = base64Data.indexOf(';base64,');
    if (semicolonIdx !== -1) {
      base64Content = base64Data.substring(semicolonIdx + 8);
    }
  }

  const buffer = Buffer.from(base64Content, 'base64');
  
  // Create unique filename
  const ext = path.extname(fileName) || '.png';
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
  
  const uploadDir = path.join(__dirname, '../../public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, uniqueName);
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${uniqueName}`;
};

// GET /api/leads - Retrieve all leads (ordered by created_at DESC)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM leads_quotes ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Database error fetching leads' });
  }
});

// POST /api/leads - Submit a new quote request or contact lead
router.post('/', async (req, res) => {
  try {
    const { full_name, email, phone, project_type, budget_range, description, files } = req.body;

    if (!full_name || !email || !project_type || !description) {
      return res.status(400).json({ error: 'Please provide full_name, email, project_type, and description.' });
    }

    // Save uploaded files if they are sent as base64
    let attachmentUrlVal = null;
    if (files && Array.isArray(files) && files.length > 0) {
      const uploadedUrls = [];
      for (const fileObj of files) {
        if (fileObj.data && fileObj.name) {
          try {
            const savedPath = saveBase64File(fileObj.data, fileObj.name);
            uploadedUrls.push(savedPath);
          } catch (err) {
            console.error('Failed to save uploaded file:', err);
          }
        }
      }
      if (uploadedUrls.length > 0) {
        attachmentUrlVal = JSON.stringify(uploadedUrls);
      }
    }

    const [result] = await db.query(
      'INSERT INTO leads_quotes (full_name, email, phone, project_type, budget_range, description, attachment_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [full_name, email, phone || null, project_type, budget_range || null, description, attachmentUrlVal]
    );

    res.status(201).json({
      message: 'Quote request submitted successfully.',
      leadId: result.insertId,
      attachment_url: attachmentUrlVal
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: 'Database error submitting quote request' });
  }
});

// PUT /api/leads/:id - Update lead status (e.g. 'pending', 'contacted', 'resolved', 'archived')
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const [result] = await db.query(
      'UPDATE leads_quotes SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ message: 'Lead status updated successfully' });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Database error updating lead status' });
  }
});

// DELETE /api/leads/:id - Delete a lead
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM leads_quotes WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ error: 'Database error deleting lead' });
  }
});

module.exports = router;
