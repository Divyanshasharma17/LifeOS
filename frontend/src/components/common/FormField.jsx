export default function FormField({ label, error, children, hint }) {
  return (
    <label className="form-field">
      {label && <span className="form-label">{label}</span>}
      {children}
      {hint && !error && <span className="form-hint">{hint}</span>}
      {error && <span className="form-error">{error}</span>}
    </label>
  );
}
