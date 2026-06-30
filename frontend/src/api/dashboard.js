import { api } from "./client";

export const dashboardApi = {
  overview() {
    return api.get("/dashboard/overview/");
  },
};
