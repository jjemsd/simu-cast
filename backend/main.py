"""
SimuCast Backend API
====================
FastAPI application that backs all 4 workflow steps:

  Step 1  /api/datasets/*   – data upload, preview, cleaning, synthetic generation
  Step 2  /api/modeling/*   – model evaluation and training
  Step 3  /api/scenarios/*  – what-if scenario simulation and storage
  Step 4  /api/reports/*    – insight generation and HTML report download

Run locally:
  pip install -r requirements.txt
  uvicorn main:app --reload --port 8000

Interactive docs:
  http://localhost:8000/docs
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routers import datasets, modeling, reports, scenarios

app = FastAPI(
    title="SimuCast API",
    description="Predictive analytics backend for the SimuCast platform",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# CORS – allow the Vite dev server (port 3000) and common local origins
# ---------------------------------------------------------------------------
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Global exception handler – ensures CORS headers are always present
# ---------------------------------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin", "")
    headers = {}
    if origin in ALLOWED_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers=headers,
    )

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(datasets.router)
app.include_router(modeling.router)
app.include_router(scenarios.router)
app.include_router(reports.router)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/", tags=["health"])
def root():
    return {"message": "SimuCast API is running", "docs": "/docs"}


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
