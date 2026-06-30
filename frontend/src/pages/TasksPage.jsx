import { useMemo, useState } from "react";
import { Plus, ListChecks, LayoutGrid, Search } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { tasksApi } from "../api/tasks";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import EmptyState from "../components/common/EmptyState";
import TaskRow from "../components/tasks/TaskRow";
import KanbanBoard from "../components/tasks/KanbanBoard";
import TaskFormModal from "../components/tasks/TaskFormModal";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
];

export default function TasksPage() {
  const [view, setView] = useState("list");
  const { data: tasks, loading, refetch, setData } = useApi(() => tasksApi.list(), []);
  const { data: board, loading: boardLoading, refetch: refetchBoard, setData: setBoard } = useApi(
    () => (view === "kanban" ? tasksApi.board() : Promise.resolve(null)),
    [view]
  );
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState("todo");
  const toast = useToast();

  const taskList = tasks?.results ?? tasks ?? [];

  const filtered = useMemo(() => {
    let list = taskList;
    if (filter !== "all") list = list.filter((t) => t.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q));
    }
    return list;
  }, [taskList, filter, search]);

  const refetchAll = () => { refetch(); if (view === "kanban") refetchBoard(); };

  const openCreate = (status = "todo") => { setEditingTask(null); setDefaultStatus(status); setModalOpen(true); };
  const openEdit = (task) => { setEditingTask(task); setModalOpen(true); };

  const handleSubmit = async (payload) => {
    if (editingTask) {
      await tasksApi.update(editingTask.id, payload);
      toast.success("Task updated.");
    } else {
      await tasksApi.create({ ...payload, status: payload.status || defaultStatus });
      toast.success("Task created.");
    }
    refetchAll();
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await tasksApi.remove(task.id);
      toast.success("Task deleted.");
      refetchAll();
    } catch (err) {
      toast.error(err.message || "Could not delete task.");
    }
  };

  const handleToggleDone = async (task) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    try {
      await tasksApi.update(task.id, { status: newStatus });
      refetchAll();
    } catch (err) {
      toast.error(err.message || "Could not update task.");
    }
  };

  const handleMoveTask = async (taskId, newStatus) => {
    // Optimistic update for snappy drag-and-drop feel.
    setBoard((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      let moved = null;
      Object.keys(next).forEach((col) => {
        const idx = next[col].findIndex((t) => t.id === taskId);
        if (idx !== -1) {
          moved = { ...next[col][idx], status: newStatus };
          next[col] = next[col].filter((t) => t.id !== taskId);
        }
      });
      if (moved) next[newStatus] = [...next[newStatus], moved];
      return next;
    });
    try {
      await tasksApi.update(taskId, { status: newStatus });
      refetch();
    } catch (err) {
      toast.error(err.message || "Could not move task.");
      refetchBoard();
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Tasks</h1>
          <p className="page-subtitle">Organize by priority and due date — switch to kanban when you want to see flow.</p>
        </div>
        <div className="task-header-actions">
          <div className="view-toggle">
            <button className={view === "list" ? "view-toggle-active" : ""} onClick={() => setView("list")}>
              <ListChecks size={15} /> List
            </button>
            <button className={view === "kanban" ? "view-toggle-active" : ""} onClick={() => setView("kanban")}>
              <LayoutGrid size={15} /> Kanban
            </button>
          </div>
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => openCreate()}>New task</Button>
        </div>
      </div>

      {view === "list" && (
        <div className="filter-bar">
          <div className="search-input">
            <Search size={15} />
            <input type="text" placeholder="Search tasks…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="filter-chips">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`filter-chip ${filter === f.key ? "filter-chip-active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {view === "list" ? (
        loading ? (
          <Spinner label="Loading tasks…" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<ListChecks size={32} />}
            title={taskList.length === 0 ? "No tasks yet" : "No tasks match your filters"}
            message={taskList.length === 0 ? "Add a task to start organizing your day." : "Try a different filter or search term."}
            action={taskList.length === 0 && <Button onClick={() => openCreate()}>Create your first task</Button>}
          />
        ) : (
          <div className="task-list">
            {filtered.map((task) => (
              <TaskRow key={task.id} task={task} onToggleDone={handleToggleDone} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        )
      ) : boardLoading ? (
        <Spinner label="Loading board…" />
      ) : (
        <KanbanBoard board={board} onMoveTask={handleMoveTask} onEditTask={openEdit} onAddTask={openCreate} />
      )}

      <TaskFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialTask={editingTask}
      />
    </div>
  );
}
