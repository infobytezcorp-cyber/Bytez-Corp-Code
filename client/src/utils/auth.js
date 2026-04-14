import toast from "react-hot-toast";

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  toast.success("Logged out successfully!");
  window.location.href = "/";
};