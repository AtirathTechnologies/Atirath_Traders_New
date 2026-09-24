from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import feedparser
import httpx
from datetime import datetime
import asyncio

app = FastAPI(title="Agriculture API - Basmati & Indian Agri")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------------------
# BASMATI RSS SOURCES (filtered for Basmati rice only)
# --------------------------------------------------------------
BASMATI_RSS_SOURCES = [
    {
        "name": "Google News - Basmati",
        "url": "https://news.google.com/rss/search?q=basmati+rice+export+import+price&hl=en-US&gl=US&ceid=US:en",
    },
    {
        "name": "Reuters Commodities - Rice",
        "url": "https://feeds.reuters.com/reuters/commodities",
    },
    {
        "name": "Business Standard - Basmati",
        "url": "https://www.business-standard.com/rss/markets-106.rss",
    },
    {
        "name": "Economic Times - Agri Commodities",
        "url": "https://economictimes.indiatimes.com/rssfeeds/4719161.cms",
    },
    {
        "name": "The Hindu Business - Rice",
        "url": "https://www.thehindu.com/business/feeder/default.rss",
    }
]

# --------------------------------------------------------------
# INDIAN AGRICULTURE RSS SOURCES (government & policy news)
# --------------------------------------------------------------
INDIAN_AGRI_RSS_SOURCES = [
    {
        "name": "DGFT Official",
        "url": "https://dgft.gov.in/CP/",
    },
    {
        "name": "Agriculture Ministry (PIB)",
        "url": "https://pib.gov.in/RssMain.aspx?ModId=2&Lang=1&Regid=2",
    },
    {
        "name": "Business Standard Agriculture",
        "url": "https://www.business-standard.com/rss/agriculture-106.rss",
    },
    {
        "name": "The Hindu Agriculture",
        "url": "https://www.thehindu.com/news/national/feeder/default.rss",
    },
    {
        "name": "Economic Times Agriculture",
        "url": "https://economictimes.indiatimes.com/rssfeeds/4719161.cms",
    }
]

# --------------------------------------------------------------
# Helper: fetch and filter Basmati feeds
# --------------------------------------------------------------
async def fetch_basmati_feed(source):
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(source["url"], timeout=20)
        feed = feedparser.parse(res.text)
        articles = []

        for entry in feed.entries[:20]:
            content = (entry.title + entry.get("summary", "")).lower()
            # Must contain at least one Basmati-specific keyword
            if any(kw in content for kw in ["basmati", "basmati rice"]):
                articles.append({
                    "title": entry.title,
                    "summary": entry.get("summary", "")[:200],
                    "link": entry.link,
                    "published": entry.get("published", datetime.now().isoformat()),
                    "source": source["name"]
                })
        return articles
    except Exception:
        return []

# --------------------------------------------------------------
# Helper: fetch Indian Agri feeds (no extra filtering)
# --------------------------------------------------------------
async def fetch_agri_feed(source):
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(source["url"], timeout=20)
        feed = feedparser.parse(res.text)
        articles = []

        for entry in feed.entries[:15]:
            articles.append({
                "title": entry.title,
                "summary": entry.get("summary", "")[:200],
                "link": entry.link,
                "published": entry.get("published", datetime.now().isoformat()),
                "source": source["name"]
            })
        return articles
    except Exception:
        return []

# --------------------------------------------------------------
# ENDPOINTS
# --------------------------------------------------------------

@app.get("/")
def home():
    return {"message": "Agriculture API is running! Available endpoints: /basmati-rss, /indian-agri-rss, /health"}

@app.get("/basmati-rss")
async def get_basmati_rss():
    """Returns latest news specifically about Basmati rice"""
    tasks = [fetch_basmati_feed(src) for src in BASMATI_RSS_SOURCES]
    results = await asyncio.gather(*tasks)
    all_articles = [item for sub in results for item in sub]

    # Remove duplicates by title
    unique_articles = []
    seen_titles = set()
    for article in all_articles:
        if article["title"] not in seen_titles:
            unique_articles.append(article)
            seen_titles.add(article["title"])

    unique_articles.sort(key=lambda x: x["published"], reverse=True)
    return {
        "count": len(unique_articles),
        "articles": unique_articles[:20],
        "last_updated": datetime.now().isoformat()
    }

@app.get("/indian-agri-rss")
async def get_indian_agri_rss():
    """Returns Indian agriculture, policy, and government scheme news"""
    tasks = [fetch_agri_feed(src) for src in INDIAN_AGRI_RSS_SOURCES]
    results = await asyncio.gather(*tasks)
    all_articles = [item for sub in results for item in sub]
    all_articles.sort(key=lambda x: x["published"], reverse=True)

    return {
        "count": len(all_articles),
        "articles": all_articles[:20],
        "last_updated": datetime.now().isoformat()
    }

@app.get("/health")
def health():
    return {
        "status": "running",
        "time": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)