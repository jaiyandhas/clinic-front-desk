#!/usr/bin/env bash
set -e

echo "======================================================="
echo "  Starting SwasthiQ Clinic Front Desk Agent"
echo "======================================================="

# Trap cleanup on exit
cleanup() {
  echo ""
  echo "Shutting down services..."
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Start Backend
echo "Starting Python FastAPI Backend on http://localhost:8000..."
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for backend health check..."
for i in {1..30}; do
  if curl -s http://localhost:8000/api/kpis >/dev/null 2>&1; then
    echo "Backend is live!"
    break
  fi
  sleep 0.5
done

# Start Frontend
echo "Starting React Frontend on http://localhost:3000..."
cd frontend
npm run dev -- --host 0.0.0.0 --port 3000 &
FRONTEND_PID=$!

echo ""
echo "======================================================="
echo "  All services running!"
echo "  - Web Application: http://localhost:3000"
echo "  - REST API Engine: http://localhost:8000/agent/run"
echo "  - API Docs:        http://localhost:8000/docs"
echo "======================================================="
echo "Press Ctrl+C to stop all services."

wait
