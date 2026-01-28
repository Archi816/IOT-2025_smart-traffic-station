import axios from "axios";

export const api = axios.create({
  baseURL: "", // same-origin
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const sensorAPI = {
  getStatus: () => api.get("/api/status"),
  getLatest: () => api.get("/api/latest"),
  getHistory: (limit = 100) => api.get("/api/history", { params: { limit } }),
};

export const authAPI = {
  register: (username, password) => api.post("/auth/register", { username, password }),

  login: (username, password) => {
    // OAuth2PasswordRequestForm требует form-urlencoded username/password [web:1][web:16]
    const body = new URLSearchParams();
    body.set("username", username);
    body.set("password", password);

    return api.post("/auth/login", body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },

  me: () => api.get("/auth/me"),
};
