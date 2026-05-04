/* components/calls/ForceLogoutConfirm.jsx */
import { useEffect } from "react";

const T = {
  card:      "#FFFFFF",
  border:    "#E8EAF0",
  text:      "#1A1D2E",
  muted:     "#8B90A7",
  accent:    "#4F6EF7",
  red:       "#EF4444",
  redSoft:   "#FEF2F2",
  redBorder: "#FECACA",
  amber:     "#F59E0B",
  amberSoft: "#FEF3C7",
  font:      "'Outfit', sans-serif",
};

export default function ForceLogoutConfirm({ agent, onConfirm, onCancel }) {
  const isBreak = agent?.status === "break";

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onCancel]);

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(26,29,46,0.50)",
        backdropFilter: "blur(5px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24, fontFamily: T.font,
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { opacity:0; transform:translateY(16px) scale(.97) }
          to   { opacity:1; transform:translateY(0)    scale(1)   }
        }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: T.card, borderRadius: 22,
          padding: "30px 28px 24px",
          width: "100%", maxWidth: 390,
          boxShadow: "0 24px 80px rgba(26,29,46,0.22)",
          border: `1.5px solid ${T.border}`,
          animation: "slideUp .22s cubic-bezier(.34,1.56,.64,1) both",
        }}
      >
        {/* icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 15,
          background: T.redSoft, border: `1.5px solid ${T.redBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, marginBottom: 18,
        }}>
          ⚠️
        </div>

        <h2 style={{ fontSize: 17, fontWeight: 800, color: T.text, margin: "0 0 8px", letterSpacing: -.3 }}>
          Force Logout Agent?
        </h2>
        <p style={{ fontSize: 13, color: T.muted, margin: "0 0 20px", lineHeight: 1.6 }}>
          <strong style={{ color: T.text }}>{agent?.name}</strong>force logout
          {isBreak ? " break" : "active work."}
          {" "}This will immediately end their current session and log them out of the system.
        </p>

        {/* agent chip */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px",
          background: isBreak ? T.amberSoft : T.redSoft,
          border: `1.5px solid ${isBreak ? "#FDE68A" : T.redBorder}`,
          borderRadius: 12, marginBottom: 22,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg,#4F6EF7,#7B93F8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0,
          }}>
            {agent?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>{agent?.name}</p>
            <p style={{
              fontSize: 10, fontWeight: 700, margin: "2px 0 0",
              color: isBreak ? T.amber : T.red,
              textTransform: "uppercase", letterSpacing: .8,
            }}>
              {isBreak ? "On Break" : "Live Online"}
            </p>
          </div>
        </div>

        {/* buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 12,
              border: `1.5px solid ${T.border}`,
              background: T.card, fontSize: 13, fontWeight: 700,
              color: T.muted, cursor: "pointer", fontFamily: T.font,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 12,
              border: "none",
              background: T.red, fontSize: 13, fontWeight: 700,
              color: "#fff", cursor: "pointer", fontFamily: T.font,
              boxShadow: `0 4px 14px ${T.red}50`,
            }}
          >
            ⏻ Yes, Logout
          </button>
        </div>

        <p style={{ fontSize: 10, color: T.muted, textAlign: "center", margin: "12px 0 0" }}>
          Esc to cancel
        </p>
      </div>
    </div>
  );
}