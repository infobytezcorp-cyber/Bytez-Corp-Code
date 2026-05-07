
import { io } from "socket.io-client";

const URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000"
).replace(/\/api$/, "");

const socket = io(URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Socket disconnected:", reason);
});

export default socket;
