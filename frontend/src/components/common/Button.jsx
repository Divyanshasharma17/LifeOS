export default function Button({
  children, variant = "primary", size = "md", icon, iconRight,
  loading = false, disabled = false, className = "", ...props
}) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner" aria-hidden="true" />
      ) : icon ? (
        <span className="btn-icon">{icon}</span>
      ) : null}
      <span>{children}</span>
      {!loading && iconRight && <span className="btn-icon">{iconRight}</span>}
    </button>
  );
}
