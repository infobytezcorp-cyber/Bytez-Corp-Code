import { io } from "socket.io-client";

const URL = import.meta.env.VITE_API_URL;

let socket;

if (!socket) {
  socket = io(URL, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });
}

export default socket;