# Production Deployment Links
- **Live Frontend (Vercel)**: [https://clinic-front-desk-dun.vercel.app](https://clinic-front-desk-dun.vercel.app)
- **Live Backend API (Render)**: [https://clinic-front-desk-api.onrender.com](https://clinic-front-desk-api.onrender.com)
- **Swagger Documentation**: [https://clinic-front-desk-api.onrender.com/docs](https://clinic-front-desk-api.onrender.com/docs)
- **Contract Endpoint**: `POST https://clinic-front-desk-api.onrender.com/agent/run`

---

## Deployment Architecture

The system is deployed across two high-availability cloud platforms:
1. **Frontend (Vercel)**: Hosted globally on Vercel's Edge Network, built with Vite and connected directly to the Render backend via `VITE_API_URL=https://clinic-front-desk-api.onrender.com`.
2. **Backend API (Render)**: Hosted as a Python 3 Web Service running Uvicorn + FastAPI with CORS enabled and atomic in-memory transactional database isolation.


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
