import { Sparkles, UploadCloud } from "lucide-react";

export default function UploadPanel({ onUpload, onLoadDemo, isLoading, error }) {
  return (
    <section className="upload-panel" aria-label="EEG upload">
      <div className="section-heading">
        <div>
          <p className="eyebrow">EEG input</p>
          <h2>Load a recording</h2>
        </div>
        <button type="button" className="icon-label-button" onClick={onLoadDemo}>
          <Sparkles size={16} aria-hidden="true" />
          Demo
        </button>
      </div>

      <label className="dropzone">
        <UploadCloud size={28} aria-hidden="true" />
        <span>Choose CSV or EDF</span>
        <input
          type="file"
          accept=".csv,.edf,text/csv,application/edf"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUpload(file);
          }}
          disabled={isLoading}
        />
      </label>

      {isLoading && <p className="helper-text">Parsing recording...</p>}
      {error && <p className="error-text">{error}</p>}
    </section>
  );
}
