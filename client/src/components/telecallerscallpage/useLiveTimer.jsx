import { useEffect, useState, useCallback } from "react";
import { TIMER_TICK_MS } from "../../components/telecallerscallpage/Utilities";

export function useLiveTimer(startIso, active = true) {
  const getElapsed = useCallback(() => {
    if (!startIso || !active) return 0;
    const diff = Math.floor((Date.now() - new Date(startIso).getTime()) / 1000);
    return diff < 0 ? 0 : diff;
  }, [startIso, active]);

  const [elapsed, setElapsed] = useState(getElapsed);

  useEffect(() => {
    if (!startIso || !active) { setElapsed(0); return; }
    setElapsed(getElapsed());
    const t = setInterval(() => setElapsed(getElapsed()), TIMER_TICK_MS);
    return () => clearInterval(t);
  }, [startIso, active, getElapsed]);

  return elapsed;
}