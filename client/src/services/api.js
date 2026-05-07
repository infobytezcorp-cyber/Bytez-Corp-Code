import axios from "axios";

// Compute a normalized base URL that always ends with a single `/api` segment.
const envUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
const normalized = (() => {
  if (import.meta.env.DEV) return "http://localhost:8000/api";
  const u = String(envUrl).trim();
  if (u.endsWith("/api")) return u.replace(/\/$/, "");
  return u.replace(/\/$/, "") + "/api";
})();

console.log('API baseURL ->', normalized);
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