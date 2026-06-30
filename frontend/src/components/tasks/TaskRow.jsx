import { Calendar, Pencil, Trash2 } from "lucide-react";
import Badge from "../common/Badge";

const PRIORITY_TONE = { low: "neutral", medium: "accent", high: "warning", urgent: "danger" };

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function TaskRow({ task, onToggleDone, onEdit, onDelete }) {
  return (
    <div className="task-row">
      <button
        className={`task-checkbox ${task.status === "done" ? "task-checkbox-done" : ""}`}
        onClick={() => onToggleDone(task)}
        aria-label={task.status === "done" ? "Mark as not done" : "Mark as done"}
      />
      <div className="task-row-main">
        <span className={`task-row-title ${task.status === "done" ? "task-row-title-done" : ""}`}>{task.title}</span>
        {task.goal_title && <span className="task-row-goal">↳ {task.goal_title}</span>}
      </div>
      <Badge tone={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
      {task.due_date && (
        <span className={`task-row-date mono ${task.is_overdue ? "task-row-date-overdue" : ""}`}>
          <Calendar size={13} /> {formatDate(task.due_date)}
        </span>
      )}
      <div className="task-row-actions">
        <button className="icon-btn" onClick={() => onEdit(task)} aria-label="Edit task"><Pencil size={14} /></button>
        <button className="icon-btn" onClick={() => onDelete(task)} aria-label="Delete task"><Trash2 size={14} /></button>
      </div>
    </div>
  );
}
