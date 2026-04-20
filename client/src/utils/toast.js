import toast from "react-hot-toast";

export const showToast = (msg, type = "success") => {
  if (type === "success") toast.success(msg);
  else if (type === "error") toast.error(msg);
  else if (type === "info") toast.info(msg);
  else if (type === "warning") toast.warning(msg);
  else if (type === "logout") toast(msg, { style: { background: "red", color: "white" } });
  else toast(msg);
};