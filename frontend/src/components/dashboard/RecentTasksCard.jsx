import { Link } from "react-router-dom";
import { ListChecks } from "lucide-react";
import Card from "../common/Card";
import Badge from "../common/Badge";
import EmptyState from "../common/EmptyState";
import Button from "../common/Button";

const STATUS_LABEL = { todo: "To do", in_progress: "In progress", review: "Review", done: "Done" };
const PRIORITY_TONE = { low: "neutral", medium: "accent", high: "warning", urgent: "danger" };

export default function RecentTasksCard({ tasks = [] }) {
  return (
    <Card>
      <div className="card-header-row">
        <h3 className="card-title">Recent tasks</h3>
        <Link to="/tasks" className="card-header-link">View all</Link>
      </div>
      {tasks.length === 0 ? (
        <EmptyState
          icon={<ListChecks size={28} />}
          title="No tasks yet"
          message="Break your goals into tasks you can knock out today."
          action={<Link to="/tasks"><Button size="sm">Create a task</Button></Link>}
        />
      ) : (
        <ul className="recent-list">
          {tasks.map((t) => (
            <li key={t.id} className="recent-task-row">
              <span className="recent-task-title">{t.title}</span>
              <div className="recent-task-badges">
                <Badge tone="neutral">{STATUS_LABEL[t.status]}</Badge>
                <Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
