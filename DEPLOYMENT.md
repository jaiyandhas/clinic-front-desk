# Deployment Guide

This guide explains how to deploy the repository to obtain a publicly hosted live link for submission requirement #2.

---

## Option 1: Frontend on Vercel + Backend on Render (Recommended & Free)

### Step 1: Push Repository to Public GitHub
1. Create a new public repository on GitHub (e.g. `swasthiq-clinic-front-desk`).
2. Run:
   ```bash
   git remote add origin https://github.com/<your-username>/swasthiq-clinic-front-desk.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy Backend to Render (Free Web Service)
1. Go to [render.com](https://render.com) and create a **New Web Service**.
2. Connect your GitHub repository.
3. Configure:
   - **Environment**: Python
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Copy the live service URL (e.g. `https://swasthiq-agent.onrender.com`).

### Step 3: Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
2. Select your GitHub repository.
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**. Your frontend live link is ready (e.g. `https://swasthiq-front-desk.vercel.app`).

---

## Option 2: Full Docker Container Deployment (Railway / Fly.io)
A `Dockerfile` is provided in the root to package both the API and client into a single deployable unit if desired.
