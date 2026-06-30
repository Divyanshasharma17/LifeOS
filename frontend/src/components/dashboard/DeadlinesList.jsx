import { Link } from "react-router-dom";
import { CalendarClock } from "lucide-react";
import Card from "../common/Card";
import Badge from "../common/Badge";
import EmptyState from "../common/EmptyState";

const PRIORITY_TONE = { low: "neutral", medium: "accent", high: "warning", urgent: "danger", critical: "danger" };

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function DeadlinesList({ deadlines = [] }) {
  return (
    <Card>
      <h3 className="card-title">Upcoming deadlines</h3>
      {deadlines.length === 0 ? (
        <EmptyState
          icon={<CalendarClock size={28} />}
          title="Nothing due this week"
          message="Goals and tasks with deadlines in the next 7 days will show up here."
        />
      ) : (
        <ul className="deadline-list">
          {deadlines.map((d) => (
            <li key={`${d.type}-${d.id}`}>
              <Link to={d.type === "goal" ? "/goals" : "/tasks"} className="deadline-row">
                <span className={`deadline-dot deadline-dot-${d.type}`} />
                <span className="deadline-title">{d.title}</span>
                <Badge tone={PRIORITY_TONE[d.priority] || "neutral"}>{d.priority}</Badge>
                <span className="deadline-date mono">{formatDate(d.date)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
