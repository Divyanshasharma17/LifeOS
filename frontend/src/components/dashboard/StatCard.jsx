import Card from "../common/Card";

export default function StatCard({ icon, label, value, sublabel, tone = "accent" }) {
  return (
    <Card className="stat-card">
      <div className={`stat-icon stat-icon-${tone}`}>{icon}</div>
      <div className="stat-body">
        <span className="stat-value mono">{value}</span>
        <span className="stat-label">{label}</span>
        {sublabel && <span className="stat-sublabel">{sublabel}</span>}
      </div>
    </Card>
  );
}
