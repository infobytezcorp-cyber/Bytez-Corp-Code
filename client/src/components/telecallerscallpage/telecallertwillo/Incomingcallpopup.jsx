import { useState } from "react";
import { useSelector } from "react-redux";
import { selectIncomingCall, selectTwilioStatus } from "../../../features/Twilioslice";

// ─────────────────────────────────────────────────────────────
// Incoming Call Popup — Telecaller page-ல show ஆகும்
// ─────────────────────────────────────────────────────────────
export const IncomingCallPopup = ({ acceptCall, rejectCall }) => {
  const status   = useSelector(selectTwilioStatus);
  const incoming = useSelector(selectIncomingCall);

  if (status !== "incoming" || !incoming) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.popup}>
        <div style={styles.ring}>📞</div>
        <h3 style={styles.title}>Incoming Call</h3>
        <p style={styles.number}>{incoming.from}</p>
        <div style={styles.btnRow}>
          <button style={styles.accept} onClick={acceptCall}>
            ✅ Accept
          </button>
          <button style={styles.reject} onClick={rejectCall}>
            ❌ Reject
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Active Call Bar — Accept பண்ணினா காட்டும்
// ─────────────────────────────────────────────────────────────
export const ActiveCallBar = ({ hangUp, toggleMute }) => {
  const status = useSelector(selectTwilioStatus);
  const call   = useSelector((s) => s.twilio.call);
  const [muted, setMuted] = useState(false);

  if (status !== "on-call" && status !== "calling") return null;

  const handleMute = () => {
    toggleMute(!muted);
    setMuted(!muted);
  };

  return (
    <div style={styles.callBar}>
      <span style={styles.callLabel}>
        🟢 On Call — {call?.from || call?.to || "..."}
      </span>
      <div style={styles.callActions}>
        <button style={styles.muteBtn} onClick={handleMute}>
          {muted ? "🔇 Unmute" : "🔊 Mute"}
        </button>
        <button style={styles.hangupBtn} onClick={hangUp}>
          📵 End Call
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const styles = {
  overlay: {
    position:        "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background:      "rgba(0,0,0,0.5)",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    zIndex:          9999,
  },
  popup: {
    background:    "#fff",
    borderRadius:  "16px",
    padding:       "32px",
    textAlign:     "center",
    minWidth:      "280px",
    boxShadow:     "0 8px 32px rgba(0,0,0,0.2)",
  },
  ring:    { fontSize: "48px", marginBottom: "8px" },
  title:   { margin: "0 0 4px", fontSize: "20px", fontWeight: 600 },
  number:  { margin: "0 0 24px", color: "#666", fontSize: "16px" },
  btnRow:  { display: "flex", gap: "16px", justifyContent: "center" },
  accept: {
    padding:       "12px 28px",
    background:    "#22c55e",
    color:         "#fff",
    border:        "none",
    borderRadius:  "8px",
    fontSize:      "16px",
    cursor:        "pointer",
  },
  reject: {
    padding:       "12px 28px",
    background:    "#ef4444",
    color:         "#fff",
    border:        "none",
    borderRadius:  "8px",
    fontSize:      "16px",
    cursor:        "pointer",
  },
  callBar: {
    position:       "fixed",
    bottom:         "24px",
    left:           "50%",
    transform:      "translateX(-50%)",
    background:     "#1e293b",
    color:          "#fff",
    padding:        "12px 24px",
    borderRadius:   "12px",
    display:        "flex",
    alignItems:     "center",
    gap:            "24px",
    zIndex:         9998,
    boxShadow:      "0 4px 16px rgba(0,0,0,0.3)",
  },
  callLabel:   { fontSize: "15px", fontWeight: 500 },
  callActions: { display: "flex", gap: "12px" },
  muteBtn: {
    padding:      "8px 16px",
    background:   "#475569",
    color:        "#fff",
    border:       "none",
    borderRadius: "8px",
    cursor:       "pointer",
  },
  hangupBtn: {
    padding:      "8px 16px",
    background:   "#ef4444",
    color:        "#fff",
    border:       "none",
    borderRadius: "8px",
    cursor:       "pointer",
  },
};