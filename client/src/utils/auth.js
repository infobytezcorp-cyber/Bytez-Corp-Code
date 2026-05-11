import toast from "react-hot-toast";
import socket from "../services/socket";

export const logout = () => {
  // Disconnect socket before logout
  socket.disconnect();

  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  toast.success("Logged out successfully!");
  window.location.href = "/";
};