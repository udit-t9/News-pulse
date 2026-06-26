import os
import re
import uuid
import urllib.parse
from datetime import datetime
import feedparser
import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["news_pulse"]

FEEDS = {
    "BBC News": "http://feeds.bbci.co.uk/news/rss.xml",
    "NPR": "https://feeds.npr.org/1001/rss.xml",
    "The Guardian": "https://www.theguardian.com/uk/rss"
}

STOP_WORDS = set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", 
    "is", "was", "were", "of", "has", "have", "it", "that", "this", "by", "from", 
    "are", "about", "more", "will", "he", "she", "they", "been", "says", "said", 
    "who", "its", "new", "after", "not", "first", "years", "could", "would", "their", 
    "than", "into", "also", "some", "over", "last", "continue", "reading", "shows", "shown"
])

def clean_text_to_keywords(text):
    clean_html = re.sub(r'<[^>]*>', '', text)
    words = re.sub(r'[^a-zA-Z\s]', '', clean_html.lower()).split()
    return list(set([w for w in words if w not in STOP_WORDS and len(w) > 3]))

def generate_sensible_label(title):
    # Extracts the core subject words from the title to build a cohesive title summary strip
    clean = re.sub(r'[^a-zA-Z\s]', '', title)
    words = clean.split()
    meaningful = [w.upper() for w in words if w.lower() not in STOP_WORDS and len(w) > 3]
    if len(meaningful) >= 2:
        return " & ".join(meaningful[:3])
    return title[:35].upper() + "..."

def extract_rss_image(entry):
    # Extracts media thumbnails directly from publisher blocks
    if 'media_thumbnail' in entry and entry['media_thumbnail']:
        return entry['media_thumbnail'][0]['url']
    if 'links' in entry:
        for link in entry['links']:
            if 'image' in link.get('type', ''):
                return link.get('href', '')
    # Dynamic fallback query builder
    clean_title = re.sub(r'[^a-zA-Z0-9\s]', '', entry.get('title', 'news'))
    keywords = [w for w in clean_title.split() if w.lower() not in STOP_WORDS][:2]
    query_str = urllib.parse.quote(",".join(keywords))
    return f"https://images.unsplash.com/featured/?{query_str or 'news'}"

def extract_full_text(url):
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        res = requests.get(url, headers=headers, timeout=5)
        if res.status_code == 200:
            soup = BeautifulSoup(res.text, "html.parser")
            paragraphs = soup.find_all('p')
            text = " ".join([p.get_text() for p in paragraphs[:6]])
            return text if len(text) > 100 else ""
    except Exception:
        pass
    return ""

def fetch_all_articles():
    articles = []
    for source_name, url in FEEDS.items():
        print(f"Parsing feed: {source_name}...")
        feed = feedparser.parse(url)
        for entry in feed.entries:
            link = entry.get("link", "")
            if not link:
                continue
                
            title = entry.get("title", "")
            summary = entry.get("summary", "")
            
            clean_title = re.sub(r'<[^>]*>', '', title)
            clean_summary = re.sub(r'<[^>]*>', '', summary) if summary else ""
            
            combined_text = f"{clean_title} {clean_summary}"
            keywords = clean_text_to_keywords(combined_text)
            story_image = extract_rss_image(entry)
            
            articles.append({
                "title": clean_title,
                "summary": clean_summary if clean_summary else "View full dispatch via wire connection link.",
                "link": link,
                "source": source_name,
                "published_at": datetime.utcnow(),
                "keywords": keywords,
                "image": story_image,
                "cluster_id": None
            })
    return articles

def cluster_articles(new_articles):
    if not new_articles:
        return
        
    all_articles = new_articles
    
    for art in all_articles:
        if art.get("cluster_id"):
            continue
            
        art_kw = set(art["keywords"])
        matched_group = [art]
        
        for other in all_articles:
            if other == art or other.get("cluster_id"):
                continue
            other_kw = set(other["keywords"])
            overlap = art_kw.intersection(other_kw)
            
            if len(overlap) >= 2:
                matched_group.append(other)
                
        cluster_id = str(uuid.uuid4())
        label = generate_sensible_label(art["title"])
            
        cluster_doc = {
            "cluster_id": cluster_id,
            "label": label,
            "created_at": datetime.utcnow()
        }
        db.clusters.insert_one(cluster_doc)
        
        for m in matched_group:
            m["cluster_id"] = cluster_id
            article_doc = {
                "title": m["title"],
                "summary": m["summary"],
                "link": m["link"],
                "source": m["source"],
                "published_at": m["published_at"],
                "cluster_id": m["cluster_id"],
                "image": m["image"]
            }
            db.articles.insert_one(article_doc)

if __name__ == "__main__":
    print("--- News Pulse Ingestion Script Engaged ---")
    new_raw_articles = fetch_all_articles()
    if new_raw_articles:
        print(f"Discovered {len(new_raw_articles)} new stories. Commencing topic aggregation...")
        cluster_articles(new_raw_articles)
        print("Processing finalized successfully.")