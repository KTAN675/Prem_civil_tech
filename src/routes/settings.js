const express = require('express');
const router = express.Router();
const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

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
    console.error('Error in saveBase64File for settings:', err);
    return base64Data;
  }
};

// Ensure settings table exists & seeded
const ensureSettingsTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value LONGTEXT
      ) ENGINE=InnoDB;
    `);

    // Check if empty, if so, seed
    const [rows] = await db.query('SELECT COUNT(*) as count FROM settings');
    if (rows[0].count === 0) {
      const defaultSettings = {
        companyName: 'Prem Civil Tech Solutions',
        tagline: 'Modern Industrial Excellence',
        logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuwxNQ2x0ov26_c0ktRnrvpuHvHWbK3o9EvpwWbeQ6Kcbwb0l0VOeCcYortQPYTLnndhiH7weyoJuuiFRk2lNTUpZ0AfhZ7n49GqpVw0FGSnbGM_XNuP9s4HnHT9mwD8uAxG_zKGWZfbzacqr1trrnwuC68ps2Lfy8HqoLGwLTw8oB8eBJnCmh_BFg9Zi9Ea9AN2LB5CVnsZM3RqbWNcs-C4Q9jRls3LdaKs8HJYygVPWTXXOpBPxmz6LUUb_sPB5haT6EeK3IN3U',
        signalColor: '#FF8C00',
        email: 'info@premciviltech.com',
        phone: '+91 98765 43210',
        address: '404 Industrial Avenue, Structural Zone, Sector 4, Mumbai, MH',
        seoTitle: 'Prem Civil Tech Solutions - Leading Civil & Structural Engineering',
        seoDesc: 'Specializing in structural auditing, waterproofing, repairs, non-destructive testing (NDT), and civil project management.',
        gaId: 'UA-1294819-2',
        facebook: 'https://facebook.com/premciviltech',
        linkedin: 'https://linkedin.com/company/premciviltech',
        instagram: 'https://instagram.com/premciviltech',
        systemAlerts: 'true',
        emailAlerts: 'true',
        maintenanceMode: 'false'
      };

      for (const [key, value] of Object.entries(defaultSettings)) {
        await db.query('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)', [key, value]);
      }
    }

    // Dynamic social links check
    const [socialRows] = await db.query('SELECT * FROM settings WHERE setting_key = ?', ['socialLinks']);
    if (socialRows.length === 0) {
      const defaultSocial = [
        { platform: 'LinkedIn', url: 'https://linkedin.com/company/premciviltech' },
        { platform: 'Facebook', url: 'https://facebook.com/premciviltech' },
        { platform: 'Instagram', url: 'https://instagram.com/premciviltech' }
      ];
      await db.query('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)', ['socialLinks', JSON.stringify(defaultSocial)]);
    }
  } catch (err) {
    console.error('Error ensuring settings table:', err);
  }
};

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    await ensureSettingsTable();
    const [rows] = await db.query('SELECT * FROM settings');
    const settingsObj = {};
    rows.forEach(row => {
      // Cast types
      if (row.setting_key === 'socialLinks') {
        try {
          settingsObj[row.setting_key] = JSON.parse(row.setting_value);
        } catch (e) {
          settingsObj[row.setting_key] = [];
        }
      } else if (row.setting_value === 'true') {
        settingsObj[row.setting_key] = true;
      } else if (row.setting_value === 'false') {
        settingsObj[row.setting_key] = false;
      } else {
        settingsObj[row.setting_key] = row.setting_value;
      }
    });
    res.json(settingsObj);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Database error fetching settings' });
  }
});

// POST /api/settings
router.post('/', async (req, res) => {
  try {
    await ensureSettingsTable();
    const settingsData = req.body;

    for (let [key, value] of Object.entries(settingsData)) {
      // Check if it's the logo to save
      if (key === 'logoUrl' && value && value.startsWith('data:')) {
        value = saveBase64File(value, 'logo.png');
      }
      
      // Convert boolean or arrays to string for storing
      let valStr;
      if (typeof value === 'object') {
        valStr = JSON.stringify(value);
      } else {
        valStr = String(value);
      }

      await db.query(
        'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, valStr, valStr]
      );
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Database error updating settings' });
  }
});

// POST /api/settings/change-password
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Default admin account is updated
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', ['admin']);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Admin account not found' });
    }

    const user = users[0];
    if (user.password_hash !== hashPassword(currentPassword)) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    const newHashed = hashPassword(newPassword);
    await db.query('UPDATE users SET password_hash = ? WHERE username = ?', [newHashed, 'admin']);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Database error changing password' });
  }
});

module.exports = router;
