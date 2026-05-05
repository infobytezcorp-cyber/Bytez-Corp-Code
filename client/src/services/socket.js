import { io } from "socket.io-client";

const URL = import.meta.env.VITE_API_URL;

const socket = io(URL, {
  transports: ["polling", "websocket"],
  reconnection: true,
  withCredentials: false,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  extraHeaders: {
    "ngrok-skip-browser-warning": "true",  // ← Add this
  },
});

export default socket;