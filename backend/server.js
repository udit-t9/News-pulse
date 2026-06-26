const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { exec } = require('child_process');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;
let MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/news_pulse';

if (MONGO_URI.includes('mongodb+srv://') && !MONGO_URI.includes('/news_pulse')) {
  if (MONGO_URI.includes('?')) {
    MONGO_URI = MONGO_URI.replace('?', '/news_pulse?');
  } else {
    MONGO_URI = MONGO_URI + '/news_pulse';
  }
}

mongoose.connect(MONGO_URI)
  .then(() => console.log(`MongoDB connected to database: ${mongoose.connection.name}`))
  .catch(err => console.error('Database connection error:', err));

const ClusterSchema = new mongoose.Schema({ cluster_id: String, label: String });
const ArticleSchema = new mongoose.Schema({ 
  title: String, 
  summary: String, 
  link: String, 
  source: String, 
  published_at: Date, 
  cluster_id: String,
  image: String 
});

const Cluster = mongoose.models.Cluster || mongoose.model('Cluster', ClusterSchema);
const Article = mongoose.models.Article || mongoose.model('Article', ArticleSchema);

app.get('/api/topics', async (req, res) => {
  try {
    const clusters = await Cluster.find().lean();
    const result = await Promise.all(clusters.map(async (c, idx) => {
      const articles = await Article.find({ cluster_id: c.cluster_id });
      return {
        id: c.cluster_id,
        // Fallback option in case cluster schema names get swapped or left blank
        label: c.label || c.title || "GENERAL WIRE",
        code: `TRACK-${(idx + 1).toString().padStart(2, '0')}`,
        article_count: articles.length || 0,
        activity: Math.min(10, articles.length || 1),
        last_updated: articles[0]?.published_at || new Date(),
        latest_headline: articles[0]?.title || ""
      };
    }));
    res.json(result);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/topics/:id/articles', async (req, res) => {
  try {
    const articles = await Article.find({ cluster_id: req.params.id });
    res.json(articles.map(a => ({ 
      id: a._id.toString(), 
      title: a.title, 
      description: a.summary || a.description || "", 
      link: a.link || a.url || "#", 
      published: a.published_at || new Date(), 
      source: a.source || "BBC News", 
      image: a.image || "" 
    })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/pipeline/trigger', (req, res) => {
  exec('"../.venv/Scripts/python.exe" ../scraper/pipeline.py', (err) => {
    if (err) console.error("Scraper process logged an anomaly:", err);
  });
  res.status(202).json({ status: "processing", triggered_at: new Date().toISOString() });
});

app.listen(PORT, () => console.log(`Backend Server live on port ${PORT}`));