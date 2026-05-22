import { Download, Plus, Trash2, Upload } from "lucide-react";
import { ANNOTATION_TYPES } from "../utils/eeg.js";

export default function AnnotationPanel({
  annotations,
  draft,
  onDraftChange,
  onAdd,
  onExport,
  onImport,
  onRemove,
  onUseViewport
}) {
  return (
    <section className="control-section" aria-label="Annotations">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Annotations</p>
          <h2>Intervals</h2>
        </div>
        <div className="button-cluster">
          <label className="icon-button" aria-label="Import annotations">
            <Upload size={16} aria-hidden="true" />
            <input
              type="file"
              accept="application/json,.json"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onImport(file);
                event.target.value = "";
              }}
            />
          </label>
          <button type="button" className="icon-button" aria-label="Export annotations" onClick={onExport}>
            <Download size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="annotation-form">
        <label>
          Start
          <input
            type="number"
            step="0.01"
            value={draft.start}
            onChange={(event) => onDraftChange({ ...draft, start: event.target.value })}
          />
        </label>
        <label>
          End
          <input
            type="number"
            step="0.01"
            value={draft.end}
            onChange={(event) => onDraftChange({ ...draft, end: event.target.value })}
          />
        </label>
        <label>
          Type
          <select
            value={draft.type}
            onChange={(event) => onDraftChange({ ...draft, type: event.target.value })}
          >
            {Object.entries(ANNOTATION_TYPES).map(([type, config]) => (
              <option key={type} value={type}>
                {config.label}
              </option>
            ))}
          </select>
        </label>

        <div className="annotation-actions">
          <button type="button" className="secondary-button" onClick={onUseViewport}>
            Use zoom
          </button>
          <button type="button" className="primary-button" onClick={onAdd}>
            <Plus size={16} aria-hidden="true" />
            Add
          </button>
        </div>
      </div>

      <div className="annotation-list">
        {annotations.length === 0 && <p className="helper-text">No intervals marked yet.</p>}
        {annotations.map((annotation) => {
          const config = ANNOTATION_TYPES[annotation.type];
          return (
            <div key={annotation.id} className="annotation-row">
              <span className="annotation-swatch" style={{ background: config.stroke }} />
              <span>
                {config.label} {annotation.start}s - {annotation.end}s
              </span>
              <button
                type="button"
                className="icon-button"
                aria-label={`Remove ${config.label} annotation`}
                onClick={() => onRemove(annotation.id)}
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
