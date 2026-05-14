import axios from "axios";

// Compute a normalized base URL that always ends with a single `/api` segment.
const rawEnvUrl = import.meta.env.VITE_API_URL;
const envUrl = typeof rawEnvUrl === "string" && rawEnvUrl.trim() ? rawEnvUrl.trim() : "http://localhost:8000";
const normalized = (() => {
  const u = envUrl.replace(/\/$/, "");
  if (u.endsWith("/api")) return u;
  return u + "/api";
})();

if (!rawEnvUrl || !rawEnvUrl.trim()) {
  console.warn("VITE_API_URL is not set. Defaulting API base URL to http://localhost:8000/api");
}
console.log("API baseURL ->", normalized);
const API = axios.create({ baseURL: normalized });

// ── Request interceptor — token attach ────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — 401 வரும்போது auto logout ─────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Telecaller and admin both go to login page
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default API;