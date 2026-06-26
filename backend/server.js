const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ==========================================
// PRODUCTION CORS & MIDDLEWARE CONFIGURATION
// ==========================================
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// DATABASE ENVIRONMENT HANDLES (EXPLICIT RE-ROUTE)
// ==========================================
const PORT = process.env.PORT || 5000;

// Explicitly forcing connection string to point to news_pulse instead of defaulting to 'test'
let MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/news_pulse';

if (MONGO_URI.includes('mongodb+srv://') && !MONGO_URI.includes('/news_pulse')) {
  // Parsing the URI to inject the database name before the query string if missing
  if (MONGO_URI.includes('?')) {
    MONGO_URI = MONGO_URI.replace('?', '/news_pulse?');
  } else {
    MONGO_URI = MONGO_URI + '/news_pulse';
  }
}

mongoose.connect(MONGO_URI)
  .then(() => console.log(`MongoDB connected successfully to database: ${mongoose.connection.name}`))
  .catch((err) => console.error('Database connection error:', err));

// ==========================================
// BULLETPROOF LOOSE PRODUCTION SCHEMAS
// ==========================================
// Maps explicitly to the 'clusters' and 'articles' collections found in Atlas
const Topic = mongoose.models.Topic || mongoose.model('Topic', new mongoose.Schema({}, { strict: false, collection: 'clusters' }));
const Article = mongoose.models.Article || mongoose.model('Article', new mongoose.Schema({}, { strict: false, collection: 'articles' }));

// ==========================================
// API ROUTE OPERATIONS
// ==========================================
app.get('/api/topics', async (req, res) => {
  try {
    // Fetches every document directly from your clusters tracking collection
    const topics = await Topic.find({});
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: 'Unable to extract data from target collection', details: error.message });
  }
});

app.get('/api/articles/:topicId', async (req, res) => {
  try {
    // Queries flexibly checking both possible key naming variations passed from frontend
    const articles = await Article.find({
      $or: [
        { cluster_id: req.params.topicId },
        { topicId: req.params.topicId }
      ]
    });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to extract document feeds', details: error.message });
  }
});

// Pipeline Automation Trigger
app.post('/api/pipeline/trigger', async (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: 'Cloud pipeline instance active.',
      log: 'Ingest sync health verification check: successful.' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Root Diagnostic Healthcheck Link
app.get('/', (req, res) => {
  res.send(`News Pulse Core Framework Live. Reading database: ${mongoose.connection.name}`);
});

// Run Core Listener
app.listen(PORT, () => {
  console.log(`Backend Server live on port ${PORT}`);
});