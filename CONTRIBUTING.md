# Contributing to NeuroScope

Thanks for helping improve NeuroScope. The project is intentionally small and research-focused, so the best contributions make EEG review clearer, faster, or easier to deploy.

## Good First Contributions

- Improve documentation and examples.
- Add small parser tests for CSV or EDF edge cases.
- Polish UI states for empty, loading, and error flows.
- Add sample data notes or screenshots.
- Improve annotation import/export validation.

## Local Development

Start the backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Run checks:

```bash
cd backend
pytest

cd ../frontend
npm run build
```

## Pull Request Guidelines

- Keep changes focused.
- Include tests or a clear manual test note for behavior changes.
- Update README or sample data docs when user-facing behavior changes.
- Avoid committing generated folders such as `node_modules`, `dist`, or `.venv`.

## Data And Safety

Do not commit private patient data, protected health information, or proprietary EEG recordings. Use synthetic data or explicitly shareable samples.

NeuroScope is not a medical device. Avoid language that implies clinical diagnosis, triage, or treatment decisions.
