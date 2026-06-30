import { Link } from "react-router-dom";
import { Target } from "lucide-react";
import Card from "../common/Card";
import ProgressBar from "../common/ProgressBar";
import EmptyState from "../common/EmptyState";
import Button from "../common/Button";

const STATUS_TONE = { not_started: "neutral", in_progress: "accent", on_hold: "warning", completed: "positive", abandoned: "danger" };

export default function RecentGoalsCard({ goals = [] }) {
  return (
    <Card>
      <div className="card-header-row">
        <h3 className="card-title">Recent goals</h3>
        <Link to="/goals" className="card-header-link">View all</Link>
      </div>
      {goals.length === 0 ? (
        <EmptyState
          icon={<Target size={28} />}
          title="No goals yet"
          message="Set your first goal to start tracking progress."
          action={<Link to="/goals"><Button size="sm">Create a goal</Button></Link>}
        />
      ) : (
        <ul className="recent-list">
          {goals.map((g) => (
            <li key={g.id} className="recent-goal-row">
              <div className="recent-goal-top">
                <span className="recent-goal-title">{g.title}</span>
                <span className={`status-dot status-dot-${STATUS_TONE[g.status]}`} />
              </div>
              <ProgressBar value={g.progress} tone={STATUS_TONE[g.status] === "positive" ? "positive" : "accent"} showLabel />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
