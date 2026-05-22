import Plot from "react-plotly.js";
import { Download, MoveHorizontal, ZoomIn } from "lucide-react";
import { ANNOTATION_TYPES, normalizeChannel } from "../utils/eeg.js";

export default function EegPlot({ dataset, selectedChannels, annotations, onViewportChange }) {
  const time = dataset?.time || [];
  const spacing = 4;
  const selected = selectedChannels.filter((channel) => dataset?.channels?.[channel]);
  const channelCount = selected.length;
  const yTickValues = selected.map((_, index) => (channelCount - index - 1) * spacing);
  const yTickText = selected;

  const traces = selected.map((channel, index) => {
    const offset = (channelCount - index - 1) * spacing;
    const y = normalizeChannel(dataset.channels[channel]).map((value) => value + offset);

    return {
      x: time,
      y,
      type: "scattergl",
      mode: "lines",
      name: channel,
      line: { width: 1.4 },
      hovertemplate: `${channel}<br>time=%{x}<br>z=%{customdata:.2f}<extra></extra>`,
      customdata: normalizeChannel(dataset.channels[channel])
    };
  });

  const shapes = annotations.map((annotation) => {
    const config = ANNOTATION_TYPES[annotation.type];
    return {
      type: "rect",
      xref: "x",
      yref: "paper",
      x0: Number(annotation.start),
      x1: Number(annotation.end),
      y0: 0,
      y1: 1,
      fillcolor: config.color,
      line: { color: config.stroke, width: 1 },
      layer: "below"
    };
  });

  return (
    <section className="plot-section" aria-label="Stacked EEG plot">
      <div className="plot-header">
        <div>
          <p className="eyebrow">{dataset?.filename || "No file loaded"}</p>
          <h2>Stacked EEG traces</h2>
        </div>
        <div className="plot-actions" aria-label="Plot capabilities">
          <span><ZoomIn size={15} aria-hidden="true" /> Zoom</span>
          <span><MoveHorizontal size={15} aria-hidden="true" /> Pan</span>
          <span><Download size={15} aria-hidden="true" /> PNG</span>
        </div>
      </div>

      <div className="plot-shell">
        {selected.length === 0 ? (
          <div className="empty-plot">Select at least one channel to view the signal.</div>
        ) : (
          <Plot
            data={traces}
            layout={{
              autosize: true,
              margin: { l: 72, r: 28, t: 18, b: 48 },
              paper_bgcolor: "rgba(0,0,0,0)",
              plot_bgcolor: "#fbfcfc",
              hovermode: "closest",
              dragmode: "pan",
              showlegend: false,
              shapes,
              xaxis: {
                title: dataset?.timeColumn || "time",
                zeroline: false,
                showgrid: true,
                gridcolor: "#e6ebef",
                rangeslider: { visible: false }
              },
              yaxis: {
                tickmode: "array",
                tickvals: yTickValues,
                ticktext: yTickText,
                showgrid: false,
                zeroline: false,
                range: [-spacing, channelCount * spacing]
              }
            }}
            config={{
              responsive: true,
              displaylogo: false,
              scrollZoom: true,
              toImageButtonOptions: {
                format: "png",
                filename: "neuroscope-eeg",
                height: 900,
                width: 1400,
                scale: 2
              },
              modeBarButtonsToRemove: ["lasso2d", "select2d"]
            }}
            useResizeHandler
            className="plot"
            onRelayout={(event) => {
              const start = event["xaxis.range[0]"];
              const end = event["xaxis.range[1]"];
              if (start !== undefined && end !== undefined) {
                onViewportChange([Number(start), Number(end)]);
              }
            }}
          />
        )}
      </div>
    </section>
  );
}
