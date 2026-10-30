# CIVISENSE — DEPLOYMENT GUIDE

This guide explains how to deploy the **CiviSense** full-stack prototype to production with zero headaches.

---

## Architecture Overview

```
                      ┌──────────────────────────────────────┐
                      │    CIVISENSE CLIENT (Frontend)       │
                      │    React 18 + Vite + TypeScript      │
                      │    Hosted on: Cloudflare Pages       │
                      │    (or Vercel / Netlify)             │
                      └──────────────────┬───────────────────┘
                                         │
                         HTTPS REST API  │ VITE_API_URL
                                         ▼
                      ┌──────────────────────────────────────┐
                      │    FASTAPI BACKEND                   │
                      │    Python 3.11 + Uvicorn + SQLite    │
                      │    Hosted on: Render.com             │
                      │    (or Railway / Fly.io / Docker)    │
                      └──────────────────┬───────────────────┘
                                         │
                                         ▼
                      ┌──────────────────────────────────────┐
                      │    PUBLIC TELEMETRY PROVIDERS        │
                      │    • Open-Meteo Weather API          │
                      │    • Copernicus DEM 90m Elevation    │
                      │    • OpenStreetMap Overpass API      │
                      └──────────────────────────────────────┘
```

---

## Option 1: Cloudflare Pages + Render.com (Recommended)

This is the fastest, cleanest, and most reliable setup:
- **Frontend:** Cloudflare Pages (Global edge CDN, unlimited bandwidth, instant SPA routing).
- **Backend:** Render.com (Native Python 3 with long-running Uvicorn server, no serverless timeouts).

### Step 1: Deploy Backend on Render.com (2 minutes)

1. Sign in to [Render Dashboard](https://dashboard.render.com/) with GitHub.
2. Click **New +** → **Web Service**.
3. Select the repository: `hemantraj-dev/civiense`.
4. Configure the service:
   * **Name:** `civisense-backend`
   * **Root Directory:** *(leave blank)*
   * **Runtime:** `Python 3`
   * **Build Command:** `pip install -r requirements.txt`
   * **Start Command:** `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
   * **Instance Type:** `Free`
5. Click **Deploy Web Service**.
6. When deployment finishes, copy your live HTTPS URL (e.g., `https://civisense-backend.onrender.com`).
   * Verify by opening: `https://civisense-backend.onrender.com/api/health`

### Step 2: Deploy Frontend on Cloudflare Pages (1 minute)

1. Sign in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the sidebar, select **Workers & Pages** → **Create Application** → **Pages** → **Connect to Git**.
3. Select `hemantraj-dev/civiense`.
4. Configure build settings:
   * **Project name:** `civisense`
   * **Production branch:** `main`
   * **Framework preset:** `Vite`
   * **Root directory:** `frontend`
   * **Build command:** `npm run build`
   * **Build output directory:** `dist`
5. Expand **Environment variables (advanced)** and add:
   * **Variable name:** `VITE_API_URL`
   * **Value:** `https://civisense-backend.onrender.com` *(your Render backend URL)*
6. Click **Save and Deploy**.
7. Cloudflare Pages builds in ~30 seconds and outputs your live link: `https://civisense.pages.dev`!

---

## Option 2: Deploy on Vercel

If deploying through the Vercel dashboard:

### A. Deploy Frontend on Vercel:
1. Import repository `hemantraj-dev/civiense`.
2. When Vercel asks: *"Select the directory containing your source code"*, select **`frontend`** (do **NOT** select `api`).
3. Framework Preset: **Vite** (auto-detected).
4. Root Directory: `frontend`.
5. Environment Variables:
   * `VITE_API_URL` = `https://your-backend-url.onrender.com`
6. Click **Deploy**.

### B. Deploy Backend on Vercel (Serverless):
1. In Vercel, import the repo as a new project.
2. When asked for directory, select **`civiense (root)`** (do **NOT** select `api`).
3. Root Directory: `.` (repository root).
4. Vercel will detect `api/index.py` and `requirements.txt`.
5. Click **Deploy**.

---

## Option 3: Docker / Container Deployment

A production-ready `Dockerfile` is included in the root directory:

```bash
# Build the container
docker build -t civisense-backend .

# Run the container
docker run -d -p 8000:8000 civisense-backend

# Verify health
curl http://localhost:8000/api/health
```

---

## Environment Variables Reference

| Variable | Scope | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | Frontend | `http://127.0.0.1:8001` | Public HTTPS URL of the FastAPI backend |
| `PORT` | Backend | `8000` | Port for Uvicorn server |
| `DATABASE_URL` | Backend | `sqlite:///./civisense.db` | SQLAlchemy connection string |
| `VERCEL` | Backend | `0` | Automatically set to `1` by Vercel for `/tmp` storage |

---

## Health Check & Verification

Once deployed, verify your endpoints:

```bash
# Health check
curl -X GET https://<YOUR_BACKEND_URL>/api/health

# Weather current telemetry
curl -X GET https://<YOUR_BACKEND_URL>/api/weather/current

# 34 Monitored Zones
curl -X GET https://<YOUR_BACKEND_URL>/api/zones

# Risk engine ranked list
curl -X GET https://<YOUR_BACKEND_URL>/api/risk/ranking
```
