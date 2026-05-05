// ─── Constants ────────────────────────────────────────────────
export const POLL_INTERVAL_MS = 5000;
export const BREAK_LIMIT_SEC = 3600;
export const TIMER_TICK_MS = 1000;

// ─── Utils ────────────────────────────────────────────────────
export function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return "00:00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function toDateStr(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function formatTimeShort(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatDateLabel(dateStr) {
  const today = toDateStr(new Date());
  const yesterday = toDateStr(new Date(Date.now() - 86400000));
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return new Date(dateStr).toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
}

export function isInRange(dateStr, from, to) {
  if (!from && !to) return true;
  if (from && dateStr < from) return false;
  if (to && dateStr > to) return false;
  return true;
}