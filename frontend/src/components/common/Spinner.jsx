export default function Spinner({ size = 22, label }) {
  return (
    <div className="spinner-wrap">
      <span className="spinner" style={{ width: size, height: size }} aria-hidden="true" />
      {label && <span className="spinner-label">{label}</span>}
    </div>
  );
}
