#!/usr/bin/env python3
"""
PalantirLearning — Daily News Scraper
=====================================
Sources:
  1. Palantir Blog RSS
  2. Palantir GitHub (new releases via GitHub API)
  3. SEC EDGAR RSS (PLTR filings)
  4. Hacker News API (palantir mentions)
  5. Reddit r/palantir (JSON feed)
  6. NewsAPI.org (general Palantir news)
  7. YouTube Data API (Palantir channel new videos)
  8. SAM.gov / USASpending (contract awards — public)
  9. Defense contractor news RSS feeds
  10. Tech news RSS feeds mentioning Palantir

Runs daily via GitHub Actions (.github/workflows/scrape.yml)
"""

import os
import sys
import json
import hashlib
import logging
import requests
import feedparser
from datetime import datetime, timezone, timedelta
from typing import Optional

# ─── Config ───────────────────────────────────────────────────────────────────
SITE_URL      = os.environ.get('SITE_URL', 'https://palantirlearning.vercel.app')
SCRAPER_TOKEN = os.environ.get('SCRAPER_TOKEN', '')
GEMINI_KEY    = os.environ.get('GEMINI_API_KEY', '')
NEWSAPI_KEY   = os.environ.get('NEWSAPI_KEY', '')
GITHUB_TOKEN  = os.environ.get('GITHUB_TOKEN', '')

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
log = logging.getLogger(__name__)

HEADERS = {'User-Agent': 'PalantirLearning/1.0 (palantirlearning.vercel.app)'}

# ─── Helpers ──────────────────────────────────────────────────────────────────

def get(url: str, params: dict = None, headers: dict = None, timeout: int = 15) -> Optional[dict]:
    """Safe GET request returning JSON or None."""
    try:
        h = {**HEADERS, **(headers or {})}
        r = requests.get(url, params=params, headers=h, timeout=timeout)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        log.warning(f"GET failed {url}: {e}")
        return None


def parse_rss(url: str) -> list[dict]:
    """Parse RSS/Atom feed, return list of item dicts."""
    try:
        feed = feedparser.parse(url)
        items = []
        for entry in feed.entries[:20]:
            summary = (
                entry.get('summary', '') or
                entry.get('description', '') or
                entry.get('content', [{}])[0].get('value', '')
            )
            # Strip HTML tags minimally
            import re
            summary = re.sub(r'<[^>]+>', ' ', summary).strip()[:1000]

            items.append({
                'title':       entry.get('title', '').strip(),
                'summary':     summary,
                'url':         entry.get('link', ''),
                'publishedAt': entry.get('published', entry.get('updated', '')),
                'source':      feed.feed.get('title', url),
            })
        return items
    except Exception as e:
        log.warning(f"RSS parse failed {url}: {e}")
        return []


def scrape_palantir_blog() -> list[dict]:
    """Official Palantir Blog RSS."""
    items = parse_rss('https://blog.palantir.com/feed')
    log.info(f"Palantir Blog: {len(items)} items")
    return items


def scrape_github_releases() -> list[dict]:
    """Recent releases from Palantir GitHub repos."""
    if not GITHUB_TOKEN:
        log.warning("No GITHUB_TOKEN — skipping GitHub releases")
        return []

    repos = [
        'palantir/osdk-ts',
        'palantir/blueprint',
        'palantir/conjure',
        'palantir/conjure-typescript',
    ]
    items = []
    headers = {'Authorization': f'token {GITHUB_TOKEN}', 'Accept': 'application/vnd.github.v3+json'}

    for repo in repos:
        data = get(f'https://api.github.com/repos/{repo}/releases', params={'per_page': 3}, headers=headers)
        if not data:
            continue
        for release in data:
            items.append({
                'title':       f"[{repo}] {release.get('name', release.get('tag_name', 'Release'))}",
                'summary':     (release.get('body', '') or '')[:500],
                'url':         release.get('html_url', ''),
                'publishedAt': release.get('published_at', ''),
                'source':      f"Palantir GitHub — {repo}",
            })

    log.info(f"GitHub Releases: {len(items)} items")
    return items


def scrape_sec_edgar() -> list[dict]:
    """PLTR SEC filings via EDGAR RSS."""
    items = parse_rss('https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=PLTR&type=8-K&dateb=&owner=include&count=10&search_text=&output=atom')
    for item in items:
        item['source'] = 'SEC EDGAR — PLTR'
    log.info(f"SEC EDGAR: {len(items)} items")
    return items


def scrape_hacker_news() -> list[dict]:
    """Hacker News stories mentioning Palantir (via Algolia API)."""
    data = get(
        'https://hn.algolia.com/api/v1/search',
        params={'query': 'palantir', 'numericFilters': 'created_at_i>1700000000', 'hitsPerPage': 15}
    )
    if not data:
        return []

    items = []
    for hit in data.get('hits', []):
        url = hit.get('url') or f"https://news.ycombinator.com/item?id={hit.get('objectID')}"
        items.append({
            'title':       hit.get('title', ''),
            'summary':     f"HN Discussion — {hit.get('num_comments', 0)} comments · {hit.get('points', 0)} points. " + (hit.get('story_text', '') or '')[:300],
            'url':         url,
            'publishedAt': hit.get('created_at', ''),
            'source':      'Hacker News',
        })

    log.info(f"Hacker News: {len(items)} items")
    return items


def scrape_reddit_palantir() -> list[dict]:
    """r/palantir new posts (JSON API — no auth needed for basic use)."""
    data = get('https://www.reddit.com/r/palantir/new.json', params={'limit': 20})
    if not data:
        return []

    items = []
    for post in data.get('data', {}).get('children', []):
        p = post.get('data', {})
        title   = p.get('title', '')
        selftext = (p.get('selftext', '') or '')[:500]
        if not title:
            continue
        items.append({
            'title':       f"[r/palantir] {title}",
            'summary':     selftext or f"Reddit discussion: {title}",
            'url':         f"https://reddit.com{p.get('permalink', '')}",
            'publishedAt': datetime.fromtimestamp(p.get('created_utc', 0), tz=timezone.utc).isoformat(),
            'source':      'Reddit r/palantir',
        })

    log.info(f"Reddit: {len(items)} items")
    return items


def scrape_newsapi() -> list[dict]:
    """NewsAPI.org — general Palantir coverage."""
    if not NEWSAPI_KEY:
        log.warning("No NEWSAPI_KEY — skipping NewsAPI")
        return []

    yesterday = (datetime.now(timezone.utc) - timedelta(days=2)).strftime('%Y-%m-%d')
    data = get(
        'https://newsapi.org/v2/everything',
        params={
            'q':        'Palantir OR "Palantir Foundry" OR "Palantir AIP"',
            'from':     yesterday,
            'sortBy':   'publishedAt',
            'pageSize': 20,
            'language': 'en',
            'apiKey':   NEWSAPI_KEY,
        }
    )
    if not data:
        return []

    items = []
    for article in data.get('articles', []):
        title = article.get('title', '')
        if not title or title == '[Removed]':
            continue
        items.append({
            'title':       title,
            'summary':     article.get('description', '') or article.get('content', '')[:500],
            'url':         article.get('url', ''),
            'publishedAt': article.get('publishedAt', ''),
            'source':      article.get('source', {}).get('name', 'NewsAPI'),
        })

    log.info(f"NewsAPI: {len(items)} items")
    return items


def scrape_defense_rss() -> list[dict]:
    """Defense/government news feeds relevant to Palantir."""
    feeds = [
        ('https://www.defenseone.com/rss/all/', 'Defense One'),
        ('https://defensescoop.com/feed/', 'DefenseScoop'),
        ('https://breakingdefense.com/feed/', 'Breaking Defense'),
    ]
    all_items = []
    for feed_url, source in feeds:
        items = parse_rss(feed_url)
        for item in items:
            # Only include if it mentions Palantir
            if 'palantir' in (item['title'] + item['summary']).lower():
                item['source'] = source
                all_items.append(item)

    log.info(f"Defense RSS (Palantir mentions): {len(all_items)} items")
    return all_items


def scrape_youtube_palantir() -> list[dict]:
    """YouTube Data API — Palantir channel new uploads."""
    # YouTube channel ID for Palantir Technologies
    CHANNEL_ID = 'UCkXRXLs6XFfP6mB0hf33phA'
    YT_KEY     = os.environ.get('YOUTUBE_API_KEY', '')

    if not YT_KEY:
        # Fallback: use RSS
        items = parse_rss(f'https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}')
        for item in items:
            item['source'] = 'Palantir YouTube'
        log.info(f"YouTube RSS: {len(items)} items")
        return items[:5]

    data = get(
        'https://www.googleapis.com/youtube/v3/search',
        params={
            'key':        YT_KEY,
            'channelId':  CHANNEL_ID,
            'part':       'snippet',
            'order':      'date',
            'maxResults': 5,
            'type':       'video',
        }
    )
    if not data:
        return []

    items = []
    for v in data.get('items', []):
        s = v.get('snippet', {})
        items.append({
            'title':       s.get('title', ''),
            'summary':     s.get('description', '')[:400],
            'url':         f"https://www.youtube.com/watch?v={v['id'].get('videoId', '')}",
            'publishedAt': s.get('publishedAt', ''),
            'source':      'Palantir YouTube',
        })

    log.info(f"YouTube API: {len(items)} items")
    return items


def scrape_tech_news_rss() -> list[dict]:
    """Tech news RSS feeds — filter for Palantir mentions."""
    feeds = [
        'https://feeds.feedburner.com/TechCrunch',
        'https://www.theverge.com/rss/index.xml',
        'https://hnrss.org/frontpage',
    ]
    all_items = []
    for feed_url in feeds:
        items = parse_rss(feed_url)
        for item in items:
            if 'palantir' in (item['title'] + item['summary']).lower():
                all_items.append(item)

    log.info(f"Tech RSS (Palantir): {len(all_items)} items")
    return all_items


# ─── Dedup & filter ───────────────────────────────────────────────────────────

def deduplicate(items: list[dict]) -> list[dict]:
    """Remove items with empty titles/URLs and deduplicate by URL."""
    seen  = set()
    clean = []
    for item in items:
        url   = (item.get('url') or '').strip()
        title = (item.get('title') or '').strip()
        if not url or not title or url in seen:
            continue
        seen.add(url)
        clean.append(item)
    return clean


# ─── POST to app ──────────────────────────────────────────────────────────────

def post_to_app(items: list[dict], endpoint: str = '/api/scraper/ingest') -> bool:
    """Send items to the PalantirLearning app."""
    if not SCRAPER_TOKEN:
        log.error("SCRAPER_TOKEN not set — cannot POST to app")
        return False

    try:
        r = requests.post(
            f'{SITE_URL}{endpoint}',
            json={'items': items},
            headers={
                'Authorization': f'Bearer {SCRAPER_TOKEN}',
                'Content-Type':  'application/json',
                **HEADERS,
            },
            timeout=60,
        )
        r.raise_for_status()
        result = r.json()
        log.info(f"Ingest result: created={result.get('created')}, skipped={result.get('skipped')}")
        return True
    except Exception as e:
        log.error(f"POST to app failed: {e}")
        return False


def trigger_summary() -> bool:
    """Trigger daily AI executive summary generation."""
    try:
        r = requests.post(
            f'{SITE_URL}/api/scraper/summarize',
            json={},
            headers={
                'Authorization': f'Bearer {SCRAPER_TOKEN}',
                'Content-Type':  'application/json',
                **HEADERS,
            },
            timeout=120,
        )
        r.raise_for_status()
        result = r.json()
        log.info(f"Summary: {result}")
        return True
    except Exception as e:
        log.error(f"Summary trigger failed: {e}")
        return False


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    log.info("=== PalantirLearning Scraper — Starting ===")
    log.info(f"Target: {SITE_URL}")

    all_items = []

    # Run all scrapers
    scrapers = [
        scrape_palantir_blog,
        scrape_github_releases,
        scrape_sec_edgar,
        scrape_hacker_news,
        scrape_reddit_palantir,
        scrape_newsapi,
        scrape_defense_rss,
        scrape_youtube_palantir,
        scrape_tech_news_rss,
    ]

    for scraper in scrapers:
        try:
            items = scraper()
            all_items.extend(items)
        except Exception as e:
            log.error(f"Scraper {scraper.__name__} failed: {e}")

    # Deduplicate
    unique_items = deduplicate(all_items)
    log.info(f"Total unique items: {len(unique_items)} (from {len(all_items)} raw)")

    if unique_items:
        # Post in batches of 20
        batch_size = 20
        for i in range(0, len(unique_items), batch_size):
            batch = unique_items[i:i + batch_size]
            log.info(f"Posting batch {i // batch_size + 1}: {len(batch)} items")
            post_to_app(batch)

    # Generate daily summary
    log.info("Triggering daily AI executive summary…")
    trigger_summary()

    log.info("=== PalantirLearning Scraper — Done ===")


if __name__ == '__main__':
    main()
