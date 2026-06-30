import { useEffect, useState } from "react";
import Modal from "../common/Modal";
import FormField from "../common/FormField";
import Button from "../common/Button";

const emptyForm = {
  title: "", description: "", category: "other", priority: "medium",
  status: "todo", due_date: "",
};

export default function TaskFormModal({ open, onClose, onSubmit, initialTask }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = Boolean(initialTask);

  useEffect(() => {
    if (open) {
      setForm(initialTask ? {
        title: initialTask.title, description: initialTask.description || "",
        category: initialTask.category, priority: initialTask.priority,
        status: initialTask.status, due_date: initialTask.due_date || "",
      } : emptyForm);
      setError("");
    }
  }, [open, initialTask]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { ...form, due_date: form.due_date || null };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.message || "Could not save task.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit task" : "New task"}>
      <form onSubmit={handleSubmit} noValidate>
        <FormField label="Title">
          <input type="text" name="title" value={form.title} onChange={onChange} required autoFocus />
        </FormField>
        <FormField label="Description" hint="Optional">
          <textarea name="description" value={form.description} onChange={onChange} rows={3} />
        </FormField>
        <div className="form-row">
          <FormField label="Category">
            <select name="category" value={form.category} onChange={onChange}>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="study">Study</option>
              <option value="health">Health</option>
              <option value="finance">Finance</option>
              <option value="other">Other</option>
            </select>
          </FormField>
          <FormField label="Priority">
            <select name="priority" value={form.priority} onChange={onChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </FormField>
        </div>
        <div className="form-row">
          <FormField label="Status">
            <select name="status" value={form.status} onChange={onChange}>
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </FormField>
          <FormField label="Due date">
            <input type="date" name="due_date" value={form.due_date} onChange={onChange} />
          </FormField>
        </div>

        {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}

        <div className="modal-form-actions">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={saving}>{isEdit ? "Save changes" : "Create task"}</Button>
        </div>
      </form>
    </Modal>
  );
}
