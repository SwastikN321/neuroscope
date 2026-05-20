# NeuroScope

NeuroScope is a small full-stack EEG visualization app for reviewing CSV recordings in a research workflow. The backend uses FastAPI and pandas to parse EEG files, while the frontend uses React, Vite, and Plotly.js for stacked interactive time-series plots.

## Features

- Upload a small EEG CSV file.
- Parse CSV data on the backend with pandas.
- View EEG channels as stacked Plotly traces.
- Select visible channels with checkboxes.
- Zoom, pan, and reset views with Plotly controls.
- Mark time intervals as `seizure`, `artifact`, or `normal`.
- Export the current plot to PNG from the Plotly toolbar.

## Project Structure

```text
neuroscope/
  frontend/
    src/
      App.jsx
      components/
      utils/
  backend/
    main.py
    eeg_loader.py
    requirements.txt
  sample_data/
  README.md
  LICENSE
```

## CSV Format

Use a header row with one time column plus one or more numeric EEG channel columns.

```csv
time,Fp1,Fp2,C3,C4
0.00,12.4,10.7,5.8,6.1
0.02,14.1,11.9,6.3,6.5
```

Accepted time column names include `time`, `timestamp`, `seconds`, `sec`, or `t`. If no time column exists, NeuroScope uses the row index as the sample axis.

## Backend Setup

```bash
cd neuroscope/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

## Frontend Setup

In a second terminal:

```bash
cd neuroscope/frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Production Build

The included Dockerfile builds the Vite frontend and serves the compiled app from FastAPI, so the deployed service is a single web process.

```bash
cd neuroscope
docker build -t neuroscope .
docker run --rm -p 8000:8000 neuroscope
```

Open `http://localhost:8000`.

## Deployment

### Render

This repository includes `render.yaml` for Render Blueprint deployment.

1. Push the repository to GitHub.
2. In Render, choose **New +** then **Blueprint**.
3. Select the `neuroscope` repository.
4. Render will build the Docker image and expose the app on one web service.

### Generic Docker Hosts

Any service that can build a Dockerfile can deploy NeuroScope. The container listens on port `8000` and exposes `/health` for health checks.

### Separate Frontend And Backend

For split deployments, set `VITE_API_BASE_URL` during the frontend build so the React app can reach the FastAPI backend:

```bash
VITE_API_BASE_URL=https://your-api.example.com npm run build
```

Set `BACKEND_CORS_ORIGINS` on the backend to the deployed frontend origin:

```bash
BACKEND_CORS_ORIGINS=https://your-frontend.example.com
```

## Try The Sample

Upload `sample_data/sample_eeg.csv` from the web app. The sample contains six EEG-like channels and a short higher-amplitude interval for testing annotations.

## API

- `GET /health` returns service status.
- `POST /api/eeg/upload` accepts a CSV file in a `file` form field and returns parsed time values, channel arrays, and metadata.

## Notes

This app is intentionally lightweight. It is designed for quick visual inspection and prototyping, not clinical diagnosis or production EEG review.

## License

MIT
