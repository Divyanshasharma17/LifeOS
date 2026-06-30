import { useMemo, useState } from "react";
import { Plus, Target, Search } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { goalsApi } from "../api/goals";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import EmptyState from "../components/common/EmptyState";
import GoalCard from "../components/goals/GoalCard";
import GoalFormModal from "../components/goals/GoalFormModal";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "in_progress", label: "In progress" },
  { key: "not_started", label: "Not started" },
  { key: "completed", label: "Completed" },
  { key: "on_hold", label: "On hold" },
];

export default function GoalsPage() {
  const { data: goals, loading, refetch, setData } = useApi(() => goalsApi.list(), []);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const toast = useToast();

  const goalsList = goals?.results ?? goals ?? [];

  const filtered = useMemo(() => {
    let list = goalsList;
    if (filter !== "all") list = list.filter((g) => g.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((g) => g.title.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q));
    }
    return list;
  }, [goalsList, filter, search]);

  const openCreate = () => { setEditingGoal(null); setModalOpen(true); };
  const openEdit = (goal) => { setEditingGoal(goal); setModalOpen(true); };

  const handleSubmit = async (payload) => {
    if (editingGoal) {
      const updated = await goalsApi.update(editingGoal.id, payload);
      toast.success("Goal updated.");
      setData((prev) => {
        const list = prev?.results ?? prev ?? [];
        return list.map((g) => (g.id === updated.id ? { ...g, ...updated, milestones: g.milestones } : g));
      });
    } else {
      await goalsApi.create(payload);
      toast.success("Goal created.");
      refetch();
    }
  };

  const handleDelete = async (goal) => {
    if (!window.confirm(`Delete "${goal.title}"? This can't be undone.`)) return;
    try {
      await goalsApi.remove(goal.id);
      toast.success("Goal deleted.");
      setData((prev) => {
        const list = prev?.results ?? prev ?? [];
        return list.filter((g) => g.id !== goal.id);
      });
    } catch (err) {
      toast.error(err.message || "Could not delete goal.");
    }
  };

  const handleToggleMilestone = async (milestone) => {
    try {
      await goalsApi.updateMilestone(milestone.id, { is_completed: !milestone.is_completed });
      refetch();
    } catch (err) {
      toast.error(err.message || "Could not update milestone.");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Goals</h1>
          <p className="page-subtitle">Track what you're working toward, broken into milestones you can actually hit.</p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={openCreate}>New goal</Button>
      </div>

      <div className="filter-bar">
        <div className="search-input">
          <Search size={15} />
          <input type="text" placeholder="Search goals…" value={search} onChange={(e) => setSearch(e.target.value)} />
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

      {loading ? (
        <Spinner label="Loading goals…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Target size={32} />}
          title={goalsList.length === 0 ? "No goals yet" : "No goals match your filters"}
          message={goalsList.length === 0 ? "Create your first goal to start tracking progress toward something meaningful." : "Try a different filter or search term."}
          action={goalsList.length === 0 && <Button onClick={openCreate}>Create your first goal</Button>}
        />
      ) : (
        <div className="grid grid-cols-3">
          {filtered.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggleMilestone={handleToggleMilestone}
            />
          ))}
        </div>
      )}

      <GoalFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialGoal={editingGoal}
      />
    </div>
  );
}
