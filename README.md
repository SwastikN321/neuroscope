# NeuroScope

![NeuroScope CI](https://github.com/SwastikN321/neuroscope/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Plotly](https://img.shields.io/badge/Plotly.js-interactive-3F4F75)

NeuroScope is a lightweight, open-source EEG visualization app for researchers, students, and builders working with neural time-series data. Upload CSV or EDF recordings, inspect stacked channels in an interactive Plotly viewer, mark intervals, and export annotations without setting up a heavyweight clinical review system.

> NeuroScope is for research, education, and prototyping. It is not a medical device and is not intended for clinical diagnosis.

## Live Demo

Live demo: coming soon.

Deployment targets are already included:

- Docker for single-service hosting.
- Render Blueprint via `render.yaml`.
- FastAPI static serving for the built React frontend.

## Screenshots

Add project screenshots after the first hosted deployment:

| Viewer | Annotation workflow |
| --- | --- |
| `docs/screenshots/viewer.png` | `docs/screenshots/annotations.png` |

## Why NeuroScope

EEG tooling is often split between notebooks, desktop applications, and lab-specific scripts. NeuroScope aims to make the first look at a recording fast, shareable, and web-native while preserving enough structure for real annotation workflows.

The project vision is to become a friendly bridge between raw biomedical signal files and collaborative neuroscience review: simple enough for teaching, extensible enough for research prototypes, and transparent enough for open science.

## Features

- CSV and EDF upload support.
- CSV parsing with pandas.
- EDF parsing with MNE-Python.
- Stacked interactive EEG channel traces with Plotly.js.
- Channel selector checkboxes.
- Zoom, pan, reset, and PNG export from the Plotly toolbar.
- Interval annotations for `seizure`, `artifact`, and `normal`.
- Annotation export/import as JSON.
- Built-in synthetic demo recording for quick exploration.
- FastAPI backend and React + Vite frontend.
- Dockerfile, Render Blueprint, and GitHub Actions CI.

## Suggested GitHub Topics

Add these topics to the repository page:

`eeg`, `neuroscience`, `epilepsy`, `fastapi`, `react`, `biomedical-signal-processing`, `neuroinformatics`

## Quickstart

### Backend

```bash
cd neuroscope/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

### Frontend

In a second terminal:

```bash
cd neuroscope/frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Sample Data

The repository includes `sample_data/sample_eeg.csv`.

NeuroScope accepts a header row with one time column plus one or more numeric channel columns:

```csv
time,Fp1,Fp2,C3,C4
0.00,12.4,10.7,5.8,6.1
0.02,14.1,11.9,6.3,6.5
0.04,15.7,13.2,6.9,7.1
```

Accepted time column names:

- `time`
- `timestamp`
- `seconds`
- `sec`
- `t`

If no time column exists, NeuroScope uses the row index as the sample axis.

EDF files are parsed with MNE-Python. EEG channels are preferred when channel type metadata is available; otherwise NeuroScope falls back to all channels in the file.

## Annotation JSON

Exports use a small, readable JSON format:

```json
{
  "version": "1.0",
  "source": {
    "filename": "sample_eeg.csv",
    "timeColumn": "time",
    "channelCount": 6
  },
  "annotations": [
    {
      "start": 3.4,
      "end": 4.8,
      "type": "seizure"
    }
  ],
  "exportedAt": "2026-05-20T00:00:00.000Z"
}
```

Supported annotation types are `seizure`, `artifact`, and `normal`.

## Production Build

The Dockerfile builds the Vite frontend and serves the compiled app from FastAPI, so the deployed service is a single web process.

```bash
cd neuroscope
docker build -t neuroscope .
docker run --rm -p 8000:8000 neuroscope
```

Open `http://localhost:8000`.

## Deployment

### Render

1. Push the repository to GitHub.
2. In Render, choose **New +** then **Blueprint**.
3. Select the `neuroscope` repository.
4. Render will build the Docker image and expose the app on one web service.

### Generic Docker Hosts

Any service that can build a Dockerfile can deploy NeuroScope. The container listens on port `8000` and exposes `/health` for health checks.

### Separate Frontend And Backend

For split deployments, set `VITE_API_BASE_URL` during the frontend build:

```bash
VITE_API_BASE_URL=https://your-api.example.com npm run build
```

Set `BACKEND_CORS_ORIGINS` on the backend:

```bash
BACKEND_CORS_ORIGINS=https://your-frontend.example.com
```

## Roadmap

- Multi-file sessions and persistent workspaces.
- Montage and filtering controls.
- Spectrogram and band-power views.
- Better EDF metadata display.
- Annotation statistics and event tables.
- BIDS-compatible export paths.
- Collaborative review mode.
- Public hosted demo with example recordings.

## Contributing

Contributions are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md), open a bug report or feature request, or propose a small improvement to the viewer, parser, docs, or sample data.

## Citation

If NeuroScope helps your research prototype, teaching material, or open-source work, cite the repository:

```bibtex
@software{neuroscope,
  title = {NeuroScope: A lightweight web EEG visualization app},
  author = {NeuroScope contributors},
  year = {2026},
  url = {https://github.com/SwastikN321/neuroscope},
  license = {MIT}
}
```

## License

MIT. See [LICENSE](LICENSE).
