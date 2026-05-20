import { useMemo, useState } from "react";
import { BrainCircuit } from "lucide-react";
import AnnotationPanel from "./components/AnnotationPanel.jsx";
import ChannelSelector from "./components/ChannelSelector.jsx";
import EegPlot from "./components/EegPlot.jsx";
import MetricStrip from "./components/MetricStrip.jsx";
import UploadPanel from "./components/UploadPanel.jsx";
import { uploadEegCsv } from "./utils/api.js";
import { getChannelNames } from "./utils/eeg.js";

const initialDraft = {
  start: "",
  end: "",
  type: "seizure"
};

export default function App() {
  const [dataset, setDataset] = useState(null);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [draft, setDraft] = useState(initialDraft);
  const [viewport, setViewport] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const channels = useMemo(() => getChannelNames(dataset), [dataset]);

  async function handleUpload(file) {
    setIsLoading(true);
    setError("");

    try {
      const parsed = await uploadEegCsv(file);
      const nextChannels = getChannelNames(parsed);
      setDataset(parsed);
      setSelectedChannels(nextChannels);
      setAnnotations([]);
      setDraft(initialDraft);
      setViewport(null);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsLoading(false);
    }
  }

  function toggleChannel(channel) {
    setSelectedChannels((current) =>
      current.includes(channel)
        ? current.filter((item) => item !== channel)
        : [...current, channel]
    );
  }

  function addAnnotation() {
    const start = Number(draft.start);
    const end = Number(draft.end);

    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      setError("Enter a valid annotation interval.");
      return;
    }

    setAnnotations((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        start: Number(start.toFixed(3)),
        end: Number(end.toFixed(3)),
        type: draft.type
      }
    ]);
    setDraft({ ...draft, start: "", end: "" });
    setError("");
  }

  function useViewportAsDraft() {
    if (!viewport) return;
    const [start, end] = viewport;
    setDraft((current) => ({
      ...current,
      start: start.toFixed(3),
      end: end.toFixed(3)
    }));
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <span className="brand-mark">
            <BrainCircuit size={26} aria-hidden="true" />
          </span>
          <div>
            <h1>NeuroScope</h1>
            <p>Research-focused EEG review</p>
          </div>
        </div>
        <div className="status-pill">{dataset ? dataset.filename : "Awaiting CSV"}</div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <UploadPanel onUpload={handleUpload} isLoading={isLoading} error={error} />
          <MetricStrip dataset={dataset} />
          <ChannelSelector
            channels={channels}
            selectedChannels={selectedChannels}
            onToggle={toggleChannel}
            onSetAll={setSelectedChannels}
          />
          <AnnotationPanel
            annotations={annotations}
            draft={draft}
            onDraftChange={setDraft}
            onAdd={addAnnotation}
            onRemove={(id) =>
              setAnnotations((current) => current.filter((annotation) => annotation.id !== id))
            }
            onUseViewport={useViewportAsDraft}
          />
        </aside>

        <EegPlot
          dataset={dataset}
          selectedChannels={selectedChannels}
          annotations={annotations}
          onViewportChange={setViewport}
        />
      </div>
    </main>
  );
}
