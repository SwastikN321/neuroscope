export default function ChannelSelector({ channels, selectedChannels, onToggle, onSetAll }) {
  const selectedSet = new Set(selectedChannels);
  const allSelected = channels.length > 0 && selectedChannels.length === channels.length;

  return (
    <section className="control-section" aria-label="Channel selector">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Channels</p>
          <h2>Visible signals</h2>
        </div>
        <button type="button" className="text-button" onClick={() => onSetAll(allSelected ? [] : channels)}>
          {allSelected ? "Clear" : "All"}
        </button>
      </div>

      <div className="channel-list">
        {channels.map((channel) => (
          <label key={channel} className="checkbox-row">
            <input
              type="checkbox"
              checked={selectedSet.has(channel)}
              onChange={() => onToggle(channel)}
            />
            <span>{channel}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
