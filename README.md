# NEWS PULSE: Executive Topic Tracking Pipeline

A full-stack editorial terminal that automatically scrapes global news feeds, groups them into coherent topic clusters, and exposes them via a high-performance brutalist dashboard. Powered by a self-hosted pipeline and a loosely coupled Mongoose data layer.

---

##  Clustering Architecture & NLP Methodology

For this project implements **TF-IDF based grouping and Vector Clustering** to dynamically organize raw wire feeds into distinct, tracked news events.

### Algorithm Breakdown
* **Vectorization:** Raw text data (combining the `headline` + `summary` string values) is processed using `scikit-learn`'s `TfidfVectorizer`. The text is lowercased, and standard English stop words (e.g., *the, is, and*) are automatically stripped to construct clean term-frequency matrices.
* **Similarity Mapping:** Instead of relying on rigid keyword matching, the pipeline calculates **Cosine Similarity** thresholds combined with an unsupervised clustering algorithm (**K-Means**) to evaluate the relative density of the topics.
* **Label Generation:** Labels (e.g., `TOP STORIES`, `WORLD`, `TECHNOLOGY`) are dynamically assigned by extracting the top-weighted TF-IDF terms from each distinct cluster vector or capturing the most representative central document headline.

### Choice of Thresholds & Parameters
* **Cluster Constraints:** The total number of track clusters ($K$) was calibrated based on daily RSS feed volume to prevent over-segmentation while maintaining distinct content separations.
* **Similarity Edge:** Articles sharing a cosine similarity coefficient above `0.45` are automatically bound to the same `cluster_id`, ensuring cohesive timelines without blending separate regional events together.

### Technical Limitations
* **Static Vocabulary Constraints:** Because classic TF-IDF weights words based purely on statistical frequency within the current batch, it lacks semantic awareness. It might occasionally separate highly related stories if journalists use entirely different synonyms (e.g., "stocks tumble" vs. "equities crash") unless explicit synonym mappings are introduced.

---

##  System Architecture & Data Contract

The framework is decoupled into three self-contained structural segments to handle async processing smoothly.

### 1. Data Schema Mapping (MongoDB Atlas)
The database enforces strict indices on relational tracking keys to ensure ultra-low latency lookups during front-end query demands.

* **`clusters` Collection:** Holds the unique tracking records.
  ```json
  {
    "_id": "ObjectId",
    "cluster_id": "String (Unique UUID/Hash)",
    "label": "String"
  }
articles Collection: Holds individual document instances mapped back to a specific parent cluster tracking point.

JSON
{
  "_id": "ObjectId",
  "cluster_id": "String (Foreign Key Index)",
  "title": "String",
  "summary": "String",
  "link": "String",
  "source": "String",
  "published_at": "ISODate",
  "image": "String"
}
2. High-Performance API Endpoints (Node.js + Express)
GET /api/topics — Pulls all tracked topic clusters, calculates real-time article counts, and dynamically computes duration metrics.

GET /api/topics/:id/articles — Extracts the corresponding underlying source documents sorted strictly by their publication timestamp.

POST /api/pipeline/trigger — Dispatches an execution handshake to run the background Python data-collection engine.

3. Brutalist Executive Terminal Layout (React)
Built using an un-compromised typographic grid, utilizing axios asynchronous fetching streams, custom smooth-scrolling intersection handles, and automated environment route configuration hooks.

🚀 Environment Variables & Local Launch
Backend Setup (/backend/.env)
Create a .env file in your server directory:

Code snippet
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/news_pulse?retryWrites=true&w=majority
To run locally:

PowerShell
npm install
npm start
Frontend Setup (/frontend/.env)
Create a .env file in your client directory:

Code snippet
VITE_API_URL=http://localhost:5000/api
To run locally:

PowerShell
npm install
npm run dev
🔄 Automated Keep-Alive Mechanics
To guarantee an uninterrupted delivery stream and bypass the standard sleep behavior of free cloud containers, a user-defined HTTP verification loop is actively configured via external Cron infrastructure. The core service receives a lightweight ping request against the root path / every 10 minutes, keeping the execution runtime warm and ready for incoming executive terminal requests 24/7.
