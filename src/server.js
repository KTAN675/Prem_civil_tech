require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const servicesRouter = require('./routes/services');
const projectsRouter = require('./routes/projects');
const testimonialsRouter = require('./routes/testimonials');
const leadsRouter = require('./routes/leads');
const authRouter = require('./routes/auth');
const teamRouter = require('./routes/team');
const galleryRouter = require('./routes/gallery');
const usersRouter = require('./routes/users');
const blogRouter = require('./routes/blog');
const settingsRouter = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Routes
app.use('/api/services', servicesRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/testimonials', testimonialsRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/auth', authRouter);
app.use('/api/team', teamRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/users', usersRouter);
app.use('/api/blog', blogRouter);
app.use('/api/settings', settingsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
