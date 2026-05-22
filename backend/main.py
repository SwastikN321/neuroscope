import os
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from eeg_loader import EEGParseError, parse_eeg_file


app = FastAPI(
    title="NeuroScope API",
    description="FastAPI backend for parsing EEG CSV and EDF uploads.",
    version="0.1.0",
)

cors_origins = os.getenv(
    "BACKEND_CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/eeg/upload")
async def upload_eeg(file: UploadFile = File(...)):
    contents = await file.read()

    try:
        return parse_eeg_file(contents, file.filename)
    except EEGParseError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="frontend")
