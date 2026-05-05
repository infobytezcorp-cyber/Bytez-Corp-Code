import axios from "axios";

const baseURL = import.meta.env.DEV
  ? "http://localhost:8000/api"
  : `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api`;

const API = axios.create({
  baseURL,
});

// ── Token interceptor ─────────────────────────────────────────

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

export default API;