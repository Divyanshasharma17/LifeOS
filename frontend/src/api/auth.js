import { api, setTokens, clearTokens } from "./client";

export const authApi = {
  async login(usernameOrEmail, password) {
    const data = await api.post("/auth/login/", { username: usernameOrEmail, password }, { auth: false });
    setTokens({ access: data.access, refresh: data.refresh });
    return data.user;
  },

  async register(payload) {
    const data = await api.post("/auth/register/", payload, { auth: false });
    setTokens({ access: data.access, refresh: data.refresh });
    return data.user;
  },

  async logout(refresh) {
    try {
      await api.post("/auth/logout/", { refresh });
    } finally {
      clearTokens();
    }
  },

  getProfile() {
    return api.get("/auth/profile/");
  },

  updateProfile(payload) {
    return api.patch("/auth/profile/", payload);
  },

  changePassword(payload) {
    return api.post("/auth/change-password/", payload);
  },
};
