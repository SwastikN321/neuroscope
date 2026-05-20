import { UploadCloud } from "lucide-react";

export default function UploadPanel({ onUpload, isLoading, error }) {
  return (
    <section className="upload-panel" aria-label="EEG CSV upload">
      <div>
        <p className="eyebrow">EEG CSV input</p>
        <h2>Load a recording</h2>
      </div>

      <label className="dropzone">
        <UploadCloud size={28} aria-hidden="true" />
        <span>Choose a small CSV file</span>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUpload(file);
          }}
          disabled={isLoading}
        />
      </label>

      {isLoading && <p className="helper-text">Parsing file with pandas...</p>}
      {error && <p className="error-text">{error}</p>}
    </section>
  );
}
