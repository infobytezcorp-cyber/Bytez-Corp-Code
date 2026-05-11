import axios from "axios";
import socket from "./socket";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
});

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
      // Token expired or invalid — disconnect socket and clear storage
      socket.disconnect();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      localStorage.removeItem("role");
      // Telecaller and admin both go to login page
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default API;