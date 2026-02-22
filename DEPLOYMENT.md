# PalantirLearning — Deployment Guide

Complete setup guide for deploying **palantirlearning.vercel.app** from scratch.

---

## Prerequisites

- GitHub account (for repo + Actions)
- Vercel account (free tier works)
- Neon account (free tier — 3GB storage)
- Google account (for OAuth + Gemini API)

---

## Step 1: Repository Setup

```bash
# Clone or create your repo
git clone https://github.com/YOUR_USERNAME/palantirlearning.git
cd palantirlearning

# Install dependencies
npm install

# Copy env template
cp .env.example .env.local
```

---

## Step 2: Neon PostgreSQL

1. Go to https://console.neon.tech
2. Create new project: **palantirlearning**
3. Copy connection strings from **Connection Details**:
   - **Pooled** → `DATABASE_URL` (with `?pgbouncer=true`)
   - **Direct** → `DATABASE_URL_UNPOOLED`
4. Push schema: `npm run db:push`
5. Seed starter data: `npm run db:seed`

---

## Step 3: Google OAuth

1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. Enable **Google+ API** or **People API**
4. Go to **APIs & Credentials → OAuth 2.0 Client IDs**
5. Create new OAuth 2.0 Client:
   - Type: **Web application**
   - Authorized JavaScript origins: `https://palantirlearning.vercel.app`
   - Authorized redirect URIs: `https://palantirlearning.vercel.app/api/auth/callback/google`
6. Copy **Client ID** and **Client Secret**

---

## Step 4: Google Gemini API

1. Go to https://aistudio.google.com/app/apikey
2. Create new API key
3. Copy the key → `GEMINI_API_KEY`

---

## Step 5: Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (first time — follow prompts)
vercel

# Or connect via Vercel Dashboard:
# 1. Go to vercel.com/new
# 2. Import GitHub repo
# 3. Framework: Next.js
# 4. Root directory: ./
```

### Set Vercel Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

```
DATABASE_URL          = postgresql://...?pgbouncer=true
DATABASE_URL_UNPOOLED = postgresql://...
NEXTAUTH_SECRET       = $(openssl rand -base64 32)
NEXTAUTH_URL          = https://palantirlearning.vercel.app
GOOGLE_CLIENT_ID      = your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET  = your-secret
OWNER_EMAIL           = your.email@gmail.com
PASSPHRASE            = your-strong-passphrase
GEMINI_API_KEY        = your-gemini-api-key
SCRAPER_TOKEN         = $(openssl rand -hex 32)
SITE_URL              = https://palantirlearning.vercel.app
NEWSAPI_KEY           = your-newsapi-key (optional)
BLOB_READ_WRITE_TOKEN = your-blob-token (for uploads)
```

### Set up Vercel Blob (for document uploads)

1. Vercel Dashboard → Storage → Create → Blob
2. Name: `palantirlearning-uploads`
3. Connect to your project
4. Copy `BLOB_READ_WRITE_TOKEN`

---

## Step 6: GitHub Actions Secrets

Go to your GitHub repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret Name    | Value                                      |
|----------------|--------------------------------------------|
| `SITE_URL`     | `https://palantirlearning.vercel.app`      |
| `SCRAPER_TOKEN`| Same as Vercel `SCRAPER_TOKEN` env var     |
| `GEMINI_API_KEY` | Same as Vercel `GEMINI_API_KEY`          |
| `NEWSAPI_KEY`  | Your NewsAPI key (optional)                |
| `GITHUB_TOKEN` | Auto-provided by GitHub Actions            |

---

## Step 7: Verify Deployment

```bash
# Test the app
curl https://palantirlearning.vercel.app/api/auth/providers

# Test scraper token (replace TOKEN with your SCRAPER_TOKEN)
curl -X POST https://palantirlearning.vercel.app/api/scraper/ingest \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"title":"Test","summary":"Test article","url":"https://example.com/test","source":"Test"}]}'

# Manually trigger the scraper
# Go to GitHub → Actions → Daily Palantir Scraper → Run workflow
```

---

## Step 8: First Login

1. Go to https://palantirlearning.vercel.app/login
2. Sign in with Google (your `OWNER_EMAIL` account)
3. You now have access to all private tabs

---

## Adding a New Tab

Edit **only** `lib/navigation.ts` — add one entry to `NAV_ITEMS`.
All nav menus, footers, home cards, and auth middleware update automatically.

---

## Local Development

```bash
npm run dev           # Start dev server at localhost:3000
npm run db:studio     # Open Prisma Studio (visual DB browser)
npm run db:seed       # Re-seed starter content

# Test scraper locally
pip install feedparser requests google-generativeai python-dateutil
export GEMINI_API_KEY=your_key
export SCRAPER_TOKEN=your_token
export SITE_URL=http://localhost:3000
python scripts/scrape_palantir.py
```

---

## Architecture Notes

- **Single nav source**: `lib/navigation.ts` → edit once, updates everywhere
- **Self-evolving**: Every note/upload creates a new DB record and permanent page
- **AI fallback chain**: Gemini 2.5 Flash → 2.5 Flash Lite → 1.5 Flash → 1.5 Flash 8B
- **Dark mode by default**: `:root` = dark, no flash on load
- **Owner-only auth**: Only `OWNER_EMAIL` can authenticate via Google or passphrase
