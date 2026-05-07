/* components/calls/QuickAccess.jsx
   ─────────────────────────────────
   Quick-access tiles for User Call Report & User Login Report.
   Props:
     onOpen(reportType)  → "call" | "login"
*/
import { useState } from "react";

const T = {
  card:        "#FFFFFF",
  border:      "#E8EAF0",
  text:        "#1A1D2E",
  muted:       "#8B90A7",
  accent:      "#4F6EF7",
  accentSoft:  "#EEF1FE",
  green:       "#18B87C",
  greenSoft:   "#E8F8F2",
  shadow:      "0 2px 12px rgba(26,29,46,0.07)",
  shadowHover: "0 6px 24px rgba(26,29,46,0.13)",
  radius:      "14px",
  font:        "'Outfit', sans-serif",
};

const TILES = [
  {
    id:      "call",
    label:   "User Call Report",
    sub:     "Calls · Missed · Answered",
    icon:    "📞",
    color:   T.green,
    soft:    T.greenSoft,
  },
  {
    id:      "login",
    label:   "User Login Report",
    sub:     "Login · Hours · Breaks",
    icon:    "🧑‍💼",
    color:   T.accent,
    soft:    T.accentSoft,
  },
];

function Tile({ tile, onOpen }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onOpen(tile.id)}
      style={{
        display:        "flex",
        alignItems:     "center",
        gap:            12,
        padding:        "12px 18px",
        background:     T.card,
        border:         `1.5px solid ${hov ? tile.color + "60" : T.border}`,
        borderRadius:   T.radius,
        boxShadow:      hov ? T.shadowHover : T.shadow,
        transform:      hov ? "translateY(-2px)" : "translateY(0)",
        transition:     "all .2s ease",
        cursor:         "pointer",
        fontFamily:     T.font,
        textAlign:      "left",
        minWidth:       190,
      }}
    >
      {/* icon bubble */}
      <div style={{
        width:          40,
        height:         40,
        borderRadius:   11,
        background:     tile.soft,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontSize:       18,
        flexShrink:     0,
        transition:     "transform .2s",
        transform:      hov ? "scale(1.1)" : "scale(1)",
      }}>
        {tile.icon}
      </div>

      {/* text */}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>
          {tile.label}
        </p>
        <p style={{ fontSize: 10, color: T.muted, margin: "2px 0 0", letterSpacing: .4 }}>
          {tile.sub}
        </p>
      </div>

      {/* chevron */}
      <span style={{
        fontSize:   13,
        color:      hov ? tile.color : T.muted,
        fontWeight: 700,
        transition: "color .2s, transform .2s",
        transform:  hov ? "translateX(3px)" : "translateX(0)",
      }}>
        ›
      </span>
    </button>
  );
}

export default function QuickAccess({ onOpen }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {/* heading */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: 1.4, textTransform: "uppercase" }}>
          ⚡ Quick Access
        </span>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {TILES.map(t => (
          <Tile key={t.id} tile={t} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}