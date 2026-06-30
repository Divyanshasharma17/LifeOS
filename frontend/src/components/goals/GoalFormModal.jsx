import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import Modal from "../common/Modal";
import FormField from "../common/FormField";
import Button from "../common/Button";

const emptyForm = {
  title: "", description: "", category: "personal", priority: "medium",
  status: "not_started", progress: 0, start_date: "", deadline: "",
};

export default function GoalFormModal({ open, onClose, onSubmit, initialGoal }) {
  const [form, setForm] = useState(emptyForm);
  const [milestoneDraft, setMilestoneDraft] = useState("");
  const [milestones, setMilestones] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEdit = Boolean(initialGoal);

  useEffect(() => {
    if (open) {
      if (initialGoal) {
        setForm({
          title: initialGoal.title, description: initialGoal.description || "",
          category: initialGoal.category, priority: initialGoal.priority,
          status: initialGoal.status, progress: initialGoal.progress,
          start_date: initialGoal.start_date || "", deadline: initialGoal.deadline || "",
        });
        setMilestones([]);
      } else {
        setForm(emptyForm);
        setMilestones([]);
      }
      setMilestoneDraft("");
      setError("");
    }
  }, [open, initialGoal]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "progress" ? Number(value) : value }));
  };

  const addMilestone = () => {
    if (!milestoneDraft.trim()) return;
    setMilestones((m) => [...m, milestoneDraft.trim()]);
    setMilestoneDraft("");
  };

  const removeMilestone = (i) => setMilestones((m) => m.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { ...form };
      payload.start_date = payload.start_date || null;
      payload.deadline = payload.deadline || null;
      if (!isEdit) payload.initial_milestones = milestones;
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.message || "Could not save goal.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit goal" : "New goal"} size="lg">
      <form onSubmit={handleSubmit} noValidate>
        <FormField label="Title">
          <input type="text" name="title" value={form.title} onChange={onChange} required autoFocus />
        </FormField>

        <FormField label="Description" hint="Optional — what does success look like?">
          <textarea name="description" value={form.description} onChange={onChange} rows={3} />
        </FormField>

        <div className="form-row">
          <FormField label="Category">
            <select name="category" value={form.category} onChange={onChange}>
              <option value="career">Career</option>
              <option value="health">Health</option>
              <option value="finance">Finance</option>
              <option value="learning">Learning</option>
              <option value="personal">Personal</option>
              <option value="relationships">Relationships</option>
              <option value="other">Other</option>
            </select>
          </FormField>
          <FormField label="Priority">
            <select name="priority" value={form.priority} onChange={onChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </FormField>
        </div>

        <div className="form-row">
          <FormField label="Status">
            <select name="status" value={form.status} onChange={onChange}>
              <option value="not_started">Not started</option>
              <option value="in_progress">In progress</option>
              <option value="on_hold">On hold</option>
              <option value="completed">Completed</option>
              <option value="abandoned">Abandoned</option>
            </select>
          </FormField>
          <FormField label={`Progress — ${form.progress}%`}>
            <input type="range" name="progress" min="0" max="100" value={form.progress} onChange={onChange} />
          </FormField>
        </div>

        <div className="form-row">
          <FormField label="Start date">
            <input type="date" name="start_date" value={form.start_date} onChange={onChange} />
          </FormField>
          <FormField label="Deadline">
            <input type="date" name="deadline" value={form.deadline} onChange={onChange} />
          </FormField>
        </div>

        {!isEdit && (
          <FormField label="Milestones" hint="Break the goal into smaller checkpoints (optional).">
            <div className="milestone-input-row">
              <input
                type="text" value={milestoneDraft}
                onChange={(e) => setMilestoneDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addMilestone(); } }}
                placeholder="e.g. Draft outline"
              />
              <Button type="button" variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addMilestone}>Add</Button>
            </div>
            {milestones.length > 0 && (
              <ul className="milestone-draft-list">
                {milestones.map((m, i) => (
                  <li key={i}>
                    <span>{m}</span>
                    <button type="button" onClick={() => removeMilestone(i)} aria-label="Remove milestone"><X size={13} /></button>
                  </li>
                ))}
              </ul>
            )}
          </FormField>
        )}

        {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}

        <div className="modal-form-actions">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={saving}>{isEdit ? "Save changes" : "Create goal"}</Button>
        </div>
      </form>
    </Modal>
  );
}
