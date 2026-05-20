import { Activity, Clock3, Layers3 } from "lucide-react";
import { formatDuration } from "../utils/eeg.js";

export default function MetricStrip({ dataset }) {
  const metadata = dataset?.metadata;

  return (
    <section className="metric-strip" aria-label="Recording metadata">
      <div className="metric">
        <Activity size={18} aria-hidden="true" />
        <span>{metadata?.sampleCount ?? 0}</span>
        <small>samples</small>
      </div>
      <div className="metric">
        <Layers3 size={18} aria-hidden="true" />
        <span>{metadata?.channelCount ?? 0}</span>
        <small>channels</small>
      </div>
      <div className="metric">
        <Clock3 size={18} aria-hidden="true" />
        <span>{formatDuration(metadata?.duration ?? 0)}</span>
        <small>duration</small>
      </div>
    </section>
  );
}
