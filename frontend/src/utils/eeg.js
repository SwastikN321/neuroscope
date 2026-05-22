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

export function createDemoDataset() {
  const sampleRate = 100;
  const seconds = 10;
  const sampleCount = sampleRate * seconds;
  const time = Array.from({ length: sampleCount }, (_, index) =>
    Number((index / sampleRate).toFixed(3))
  );
  const channelNames = ["Fp1", "Fp2", "C3", "C4", "O1", "O2", "T3", "T4"];

  const channels = Object.fromEntries(
    channelNames.map((channel, channelIndex) => {
      const values = time.map((t) => {
        const alpha = Math.sin(2 * Math.PI * (8 + channelIndex * 0.35) * t);
        const theta = 0.45 * Math.sin(2 * Math.PI * (4.5 + channelIndex * 0.2) * t + channelIndex);
        const burst = t > 3.4 && t < 4.8 ? 2.8 * Math.sin(2 * Math.PI * 14 * t) : 0;
        const drift = 0.35 * Math.sin(2 * Math.PI * 0.25 * t + channelIndex / 2);
        return Number(((alpha + theta + burst + drift) * (18 - channelIndex)).toFixed(4));
      });

      return [channel, values];
    })
  );

  return {
    filename: "demo-eeg.csv",
    time,
    timeColumn: "time",
    channels,
    metadata: {
      fileType: "synthetic",
      sampleCount,
      channelCount: channelNames.length,
      duration: seconds,
      samplingFrequency: sampleRate,
      downsampled: false
    }
  };
}

export function buildAnnotationExport(dataset, annotations) {
  return {
    version: "1.0",
    source: {
      filename: dataset?.filename || null,
      timeColumn: dataset?.timeColumn || null,
      channelCount: dataset?.metadata?.channelCount || 0
    },
    annotations: annotations.map(({ id, ...annotation }) => annotation),
    exportedAt: new Date().toISOString()
  };
}

export function validateImportedAnnotations(payload) {
  if (!payload || !Array.isArray(payload.annotations)) {
    throw new Error("Annotation JSON must include an annotations array.");
  }

  return payload.annotations.map((annotation, index) => {
    const start = Number(annotation.start);
    const end = Number(annotation.end);
    const type = annotation.type;

    if (!ANNOTATION_TYPES[type]) {
      throw new Error(`Annotation ${index + 1} uses an unknown type.`);
    }

    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      throw new Error(`Annotation ${index + 1} has an invalid interval.`);
    }

    return {
      id: crypto.randomUUID(),
      start: Number(start.toFixed(3)),
      end: Number(end.toFixed(3)),
      type
    };
  });
}
