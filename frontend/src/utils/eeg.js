export const ANNOTATION_TYPES = {
  seizure: {
    label: "Seizure",
    color: "rgba(226, 68, 92, 0.18)",
    stroke: "#d7263d"
  },
  artifact: {
    label: "Artifact",
    color: "rgba(239, 148, 52, 0.18)",
    stroke: "#c56b12"
  },
  normal: {
    label: "Normal",
    color: "rgba(48, 144, 120, 0.16)",
    stroke: "#1d8068"
  }
};

export function normalizeChannel(values) {
  if (!values?.length) return [];

  const clean = values.map((value) => Number(value) || 0);
  const mean = clean.reduce((sum, value) => sum + value, 0) / clean.length;
  const variance =
    clean.reduce((sum, value) => sum + (value - mean) ** 2, 0) / clean.length;
  const std = Math.sqrt(variance) || 1;

  return clean.map((value) => (value - mean) / std);
}

export function getChannelNames(dataset) {
  return Object.keys(dataset?.channels || {});
}

export function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return "0 s";
  if (seconds < 60) return `${seconds.toFixed(2)} s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}m ${remaining.toFixed(0)}s`;
}
