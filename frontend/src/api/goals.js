import { api } from "./client";

export const goalsApi = {
  list(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/goals/${qs ? `?${qs}` : ""}`);
  },
  get(id) {
    return api.get(`/goals/${id}/`);
  },
  create(payload) {
    return api.post("/goals/", payload);
  },
  update(id, payload) {
    return api.patch(`/goals/${id}/`, payload);
  },
  remove(id) {
    return api.delete(`/goals/${id}/`);
  },
  stats() {
    return api.get("/goals/stats/");
  },
  updateMilestone(id, payload) {
    return api.patch(`/milestones/${id}/`, payload);
  },
  createMilestone(payload) {
    return api.post("/milestones/", payload);
  },
  removeMilestone(id) {
    return api.delete(`/milestones/${id}/`);
  },
};
