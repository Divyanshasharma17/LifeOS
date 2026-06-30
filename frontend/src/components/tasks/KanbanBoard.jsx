import { useState } from "react";
import { Plus } from "lucide-react";
import Badge from "../common/Badge";

const COLUMNS = [
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
];

const PRIORITY_TONE = { low: "neutral", medium: "accent", high: "warning", urgent: "danger" };

export default function KanbanBoard({ board, onMoveTask, onEditTask, onAddTask }) {
  const [dragTaskId, setDragTaskId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const handleDrop = (columnKey) => {
    if (dragTaskId != null) onMoveTask(dragTaskId, columnKey);
    setDragTaskId(null);
    setDragOverCol(null);
  };

  return (
    <div className="kanban-board">
      {COLUMNS.map((col) => {
        const tasks = board?.[col.key] || [];
        return (
          <div
            key={col.key}
            className={`kanban-column ${dragOverCol === col.key ? "kanban-column-over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.key); }}
            onDragLeave={() => setDragOverCol((c) => (c === col.key ? null : c))}
            onDrop={() => handleDrop(col.key)}
          >
            <div className="kanban-column-header">
              <span>{col.label}</span>
              <span className="kanban-count">{tasks.length}</span>
            </div>

            <div className="kanban-cards">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="kanban-card"
                  draggable
                  onDragStart={() => setDragTaskId(task.id)}
                  onClick={() => onEditTask(task)}
                >
                  <p className="kanban-card-title">{task.title}</p>
                  <div className="kanban-card-footer">
                    <Badge tone={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
                    {task.due_date && (
                      <span className={`kanban-card-date mono ${task.is_overdue ? "task-row-date-overdue" : ""}`}>
                        {new Date(task.due_date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button className="kanban-add-btn" onClick={() => onAddTask(col.key)}>
              <Plus size={14} /> Add task
            </button>
          </div>
        );
      })}
    </div>
  );
}
