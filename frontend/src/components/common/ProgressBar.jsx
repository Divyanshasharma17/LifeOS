export default function ProgressBar({ value = 0, tone = "accent", height = 8, showLabel = false }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="progress-wrap">
      <div className="progress-track" style={{ height }}>
        <div
          className={`progress-fill progress-fill-${tone}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && <span className="progress-label mono">{clamped}%</span>}
    </div>
  );
}
