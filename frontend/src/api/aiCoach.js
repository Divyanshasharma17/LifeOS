import { api } from "./client";

export const aiCoachApi = {
  recommendations() {
    return api.get("/ai/recommendations/");
  },
  dailySummary() {
    return api.get("/ai/summary/daily/");
  },
  weeklySummary() {
    return api.get("/ai/summary/weekly/");
  },
  monthlySummary() {
    return api.get("/ai/summary/monthly/");
  },
  goalForecast() {
    return api.get("/ai/goal-forecast/");
  },
  chatHistory() {
    return api.get("/ai/chat/");
  },
  sendChat(message) {
    return api.post("/ai/chat/", { message });
  },
  clearChat() {
    return api.delete("/ai/chat/");
  },
  status() {
    return api.get("/ai/status/");
  },
};
