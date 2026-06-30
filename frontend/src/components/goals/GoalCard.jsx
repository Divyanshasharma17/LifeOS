import { useState } from "react";
import { MoreVertical, Calendar, Pencil, Trash2, CheckSquare, Square } from "lucide-react";
import Card from "../common/Card";
import Badge from "../common/Badge";
import ProgressBar from "../common/ProgressBar";

const PRIORITY_TONE = { low: "neutral", medium: "accent", high: "warning", critical: "danger" };
const STATUS_TONE = { not_started: "neutral", in_progress: "accent", on_hold: "warning", completed: "positive", abandoned: "danger" };
const STATUS_LABEL = { not_started: "Not started", in_progress: "In progress", on_hold: "On hold", completed: "Completed", abandoned: "Abandoned" };

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function GoalCard({ goal, onEdit, onDelete, onToggleMilestone }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="goal-card">
      <div className="goal-card-top">
        <div className="goal-card-tags">
          <Badge tone="violet">{goal.category}</Badge>
          <Badge tone={PRIORITY_TONE[goal.priority]}>{goal.priority}</Badge>
          {goal.is_overdue && <Badge tone="danger">Overdue</Badge>}
        </div>
        <div className="goal-card-menu-wrap">
          <button className="icon-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Goal options">
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="goal-card-menu">
              <button onClick={() => { setMenuOpen(false); onEdit(goal); }}><Pencil size={14} /> Edit</button>
              <button onClick={() => { setMenuOpen(false); onDelete(goal); }} className="user-menu-danger"><Trash2 size={14} /> Delete</button>
            </div>
          )}
        </div>
      </div>

      <h4 className="goal-card-title">{goal.title}</h4>
      {goal.description && <p className="goal-card-desc">{goal.description}</p>}

      <div className="goal-card-progress">
        <ProgressBar value={goal.progress} tone={goal.status === "completed" ? "positive" : "accent"} showLabel />
      </div>

      <div className="goal-card-meta">
        <Badge tone={STATUS_TONE[goal.status]}>{STATUS_LABEL[goal.status]}</Badge>
        {goal.deadline && (
          <span className="goal-card-deadline mono">
            <Calendar size={13} /> {formatDate(goal.deadline)}
            {typeof goal.days_remaining === "number" && goal.days_remaining >= 0 && (
              <span className="goal-days-left"> · {goal.days_remaining}d left</span>
            )}
          </span>
        )}
      </div>

      {goal.milestones?.length > 0 && (
        <div className="goal-milestones">
          <button className="goal-milestones-toggle" onClick={() => setExpanded((e) => !e)}>
            {goal.milestones.filter((m) => m.is_completed).length}/{goal.milestones.length} milestones
            {" "}{expanded ? "▾" : "▸"}
          </button>
          {expanded && (
            <ul className="milestone-list">
              {goal.milestones.map((m) => (
                <li key={m.id}>
                  <button className="milestone-row" onClick={() => onToggleMilestone(m)}>
                    {m.is_completed ? <CheckSquare size={16} /> : <Square size={16} />}
                    <span className={m.is_completed ? "milestone-done" : ""}>{m.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}
