import { api } from "./client";

export const tasksApi = {
  list(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/tasks/${qs ? `?${qs}` : ""}`);
  },
  board() {
    return api.get("/tasks/board/");
  },
  create(payload) {
    return api.post("/tasks/", payload);
  },
  update(id, payload) {
    return api.patch(`/tasks/${id}/`, payload);
  },
  remove(id) {
    return api.delete(`/tasks/${id}/`);
  },
  reorder(items) {
    return api.post("/tasks/reorder/", items);
  },
  stats() {
    return api.get("/tasks/stats/");
  },
};
