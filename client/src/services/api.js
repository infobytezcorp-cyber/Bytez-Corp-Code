import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
  
});

// ── Token interceptor ─────────────────────────────────────────
// Every request-க்கு முன்னாடி token header automatic ஆ attach ஆகும்
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // ← உங்க key name வை
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;