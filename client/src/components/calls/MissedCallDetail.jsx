// src/components/calls/MissedCallDetail.jsx
// Matches the Enquiry Live Dashboard design from screenshots

import { useState } from "react";

const T = {
  bg:          "#F5F6FA",
  card:        "#FFFFFF",
  border:      "#E8EAF0",
  borderLight: "#F0F1F6",
  text:        "#1A1D2E",
  muted:       "#8B90A7",
  accent:      "#4F6EF7",
  accentSoft:  "#EEF1FE",
  green:       "#18B87C",
  greenSoft:   "#E8F8F2",
  red:         "#EF4444",
  redSoft:     "#FEF2F2",
  shadow:      "0 2px 12px rgba(26,29,46,0.07)",
  shadowHover: "0 6px 24px rgba(26,29,46,0.12)",
  radius:      "16px",
  radiusSm:    "10px",
  font:        "'Outfit', sans-serif",
};

function DetailRow({ label, value, valueColor }) {
  return (
    <div style={{
      display:        "flex",
      justifyContent: "space-between",
      alignItems:     "center",
      padding:        "13px 0",
      borderBottom:   `1px solid ${T.borderLight}`,
    }}>
      <span style={{
        fontSize:      11,
        fontWeight:    600,
        color:         T.muted,
        textTransform: "uppercase",
        letterSpacing: 0.8,
      }}>
        {label}
      </span>
      <span style={{
        fontSize:   13,
        fontWeight: 600,
        color:      valueColor || T.text,
        maxWidth:   260,
        textAlign:  "right",
        overflow:   "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}>
        {value || "—"}
      </span>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    missed:      { bg: T.redSoft,   color: T.red,         label: "Missed" },
    incoming:    { bg: "#EEF1FE",   color: T.accent,      label: "Incoming" },
    answered:    { bg: T.greenSoft, color: T.green,        label: "Answered" },
    completed:   { bg: T.greenSoft, color: T.green,        label: "Completed" },
    in_progress: { bg: "#FEF3C7",   color: "#F59E0B",      label: "In Progress" },
    assigned:    { bg: "#FEF3C7",   color: "#F59E0B",      label: "Assigned" },
  };
  const s = map[status?.toLowerCase()] || { bg: T.borderLight, color: T.muted, label: status || "Unknown" };
  return (
    <span style={{
      display:      "inline-flex",
      alignItems:   "center",
      gap:          5,
      padding:      "3px 10px",
      borderRadius: 99,
      fontSize:     11,
      fontWeight:   700,
      background:   s.bg,
      color:        s.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

export default function MissedCallDetail({ call, onBack, onCallback }) {
  const [calling, setCalling] = useState(false);
  const [showCallbackPopup, setShowCallbackPopup] = useState(false);

  const handleCallback = () => {
    setShowCallbackPopup(false);
    setCalling(true);
    setTimeout(() => {
      onCallback(call._id);
      setCalling(false);
    }, 600);
  };

  const callerName   = call.contact?.name || null;
  const callerNumber = call.number || "Unknown";
  const waitDuration = call.waitDuration || call.waited || null;
  const missedReason = call.reason || call.missedReason || null;

  return (
    <div style={{
      minHeight:  "100%",
      background: T.bg,
      fontFamily: T.font,
      padding:    "28px 32px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>

      {/* ── Back button ── */}
      {showCallbackPopup && (
        <div
          onClick={() => !calling && setShowCallbackPopup(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "rgba(15,23,42,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 380,
              background: T.card,
              borderRadius: 18,
              border: `1.5px solid ${T.border}`,
              boxShadow: "0 20px 60px rgba(15,23,42,0.22)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "22px 22px 14px", borderBottom: `1px solid ${T.borderLight}` }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: T.text }}>Start callback?</p>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: T.muted, lineHeight: 1.5 }}>
                This will mark the missed call as callback initiated and create an outgoing call entry.
              </p>
            </div>
            <div style={{ padding: "14px 22px" }}>
              <DetailRow label="Caller" value={callerName || callerNumber} />
              <DetailRow label="Number" value={callerNumber} />
              <DetailRow label="Agent" value={call.assignedTo?.name || call.agent?.name || "Unassigned"} />
            </div>
            <div style={{ display: "flex", gap: 10, padding: "0 22px 22px" }}>
              <button
                onClick={() => setShowCallbackPopup(false)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: T.radiusSm,
                  border: `1.5px solid ${T.border}`,
                  background: T.card,
                  fontSize: 13,
                  fontWeight: 700,
                  color: T.muted,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCallback}
                style={{
                  flex: 1.5,
                  padding: "10px 0",
                  borderRadius: T.radiusSm,
                  border: "none",
                  background: T.accent,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#fff",
                  cursor: "pointer",
                  boxShadow: `0 4px 14px ${T.accent}40`,
                }}
              >
                Call Back
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onBack}
        style={{
          display:     "flex",
          alignItems:  "center",
          gap:         8,
          padding:     "8px 14px",
          border:      `1.5px solid ${T.border}`,
          borderRadius: T.radiusSm,
          background:  T.card,
          fontSize:    13,
          fontWeight:  600,
          color:       T.muted,
          cursor:      "pointer",
          fontFamily:  T.font,
          marginBottom: 22,
          transition:  "all .15s ease",
        }}
        onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.borderColor = T.accent; }}
        onMouseLeave={e => { e.currentTarget.style.color = T.muted; e.currentTarget.style.borderColor = T.border; }}
      >
        ← Back to Dashboard
      </button>

      {/* ── Main Card ── */}
      <div style={{
        maxWidth:   520,
        background: T.card,
        border:     `1.5px solid ${T.border}`,
        borderRadius: T.radius,
        boxShadow:  T.shadow,
        overflow:   "hidden",
        animation:  "fadeUp .3s ease both",
      }}>

        {/* Caller Header */}
        <div style={{
          padding:    "28px 28px 24px",
          borderBottom: `1.5px solid ${T.borderLight}`,
          display:    "flex",
          alignItems: "center",
          gap:        16,
        }}>
          {/* Avatar */}
          <div style={{
            width:          56,
            height:         56,
            borderRadius:   16,
            background:     T.redSoft,
            border:         `1.5px solid #FECACA`,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            fontSize:       22,
            flexShrink:     0,
          }}>
            📵
          </div>

          {/* Name / Number */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {callerName && (
              <p style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: "0 0 2px", letterSpacing: -.3 }}>
                {callerName}
              </p>
            )}
            <p style={{
              fontSize:   callerName ? 13 : 18,
              fontWeight: callerName ? 600 : 800,
              color:      callerName ? T.muted : T.text,
              margin:     0,
              letterSpacing: -.2,
            }}>
              {callerNumber}
            </p>
          </div>

          {/* Status pill */}
          <StatusPill status={call.status} />
        </div>

        {/* Detail Rows */}
        <div style={{ padding: "6px 28px 12px" }}>
          <DetailRow label="Call Type"      value={call.type ? call.type.charAt(0).toUpperCase() + call.type.slice(1) : "Incoming"} />
          <DetailRow label="Status"         value={call.status} valueColor={T.red} />
          <DetailRow label="Assigned Agent" value={call.assignedTo?.name || call.agent?.name || "Unassigned"} />

          {waitDuration && (
            <DetailRow label="Wait Duration" value={`${waitDuration}s`} />
          )}

          {missedReason && (
            <DetailRow label="Missed Reason" value={missedReason} valueColor={T.muted} />
          )}

          <DetailRow
            label="Time"
            value={
              call.startTime || call.createdAt
                ? new Date(call.startTime || call.createdAt).toLocaleString([], {
                    day: "2-digit", month: "short",
                    hour: "2-digit", minute: "2-digit",
                  })
                : "—"
            }
          />

          <div style={{ borderBottom: "none" }}>
            <DetailRow label="Call ID" value={call._id} valueColor={T.muted} />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          padding:     "16px 28px 24px",
          display:     "flex",
          gap:         10,
          borderTop:   `1.5px solid ${T.borderLight}`,
        }}>
          <button
            onClick={onBack}
            style={{
              flex:         1,
              padding:      "11px 0",
              border:       `1.5px solid ${T.border}`,
              borderRadius: T.radiusSm,
              background:   T.card,
              fontSize:     13,
              fontWeight:   700,
              color:        T.muted,
              cursor:       "pointer",
              fontFamily:   T.font,
              transition:   "all .15s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = T.bg; e.currentTarget.style.color = T.text; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.card; e.currentTarget.style.color = T.muted; }}
          >
            ← Back
          </button>

          <button
            onClick={() => setShowCallbackPopup(true)}
            disabled={calling}
            style={{
              flex:         2,
              padding:      "11px 0",
              border:       "none",
              borderRadius: T.radiusSm,
              background:   calling ? "#93C5FD" : T.accent,
              fontSize:     13,
              fontWeight:   700,
              color:        "#fff",
              cursor:       calling ? "not-allowed" : "pointer",
              fontFamily:   T.font,
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
              gap:          7,
              boxShadow:    `0 4px 14px ${T.accent}40`,
              transition:   "all .18s ease",
            }}
            onMouseEnter={e => { if (!calling) e.currentTarget.style.background = "#3B5CE4"; }}
            onMouseLeave={e => { if (!calling) e.currentTarget.style.background = T.accent; }}
          >
            {calling ? (
              <>
                <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.4)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />
                Calling…
              </>
            ) : (
              <>📞 Call Back Now</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
