const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ==========================================
// PRODUCTION CORS & MIDDLEWARE CONFIGURATION
// ==========================================
app.use(cors({
  origin: '*', // Allows Vercel production domains to fetch routes cleanly
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// DATABASE ENVIRONMENT HANDLES
// ==========================================
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/news_pulse';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connection verified.'))
  .catch((err) => console.error('Database connection error:', err));

// ==========================================
// SCHEMAS & ROUTE DEFINITIONS
// ==========================================
const topicSchema = new mongoose.Schema({
  title: String,
  summary: String,
  category: String,
  timestamp: { type: Date, default: Date.now },
  articlesCount: Number
});

const articleSchema = new mongoose.Schema({
  topicId: mongoose.Schema.Types.ObjectId,
  title: String,
  source: String,
  url: String,
  publishedAt: String,
  content: String
});

const Topic = mongoose.models.Topic || mongoose.model('Topic', topicSchema);
const Article = mongoose.models.Article || mongoose.model('Article', articleSchema);

// API Routes
app.get('/api/topics', async (req, res) => {
  try {
    const topics = await Topic.find().sort({ timestamp: -1 });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: 'Unable to reach the wire' });
  }
});

app.get('/api/articles/:topicId', async (req, res) => {
  try {
    const articles = await Article.find({ topicId: req.params.topicId });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to extract document feeds' });
  }
});

// Pipeline Automation Trigger
app.post('/api/pipeline/trigger', async (req, res) => {
  try {
    const { exec } = require('child_process');
    // Triggers local python processor pathing safely if executed
    exec('python ../scraper/pipeline.py', (error, stdout, stderr) => {
      if (error) {
        console.error(`Pipeline runtime err: ${error}`);
        return res.status(500).json({ success: false, error: error.message });
      }
      res.json({ success: true, log: stdout });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Root Diagnostic Healthcheck Link
app.get('/', (req, res) => {
  res.send('News Pulse Core System Framework Operational Engine Live.');
});

// Run Core Listener
app.listen(PORT, () => {
  console.log(`Backend Server live on port ${PORT}`);
});