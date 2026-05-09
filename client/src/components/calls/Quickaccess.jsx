// src/components/calls/QuickAccess.jsx
// Matches the Enquiry Live Dashboard design from screenshots
// Props: onOpen(reportType) → "call" | "login"

import { useState } from "react";

const T = {
  card:        "#FFFFFF",
  border:      "#E8EAF0",
  borderLight: "#F0F1F6",
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
    id:    "call",
    label: "Call report",
    icon:  "📞",
    color: T.text,
    soft:  T.borderLight,
    border: T.border,
  },
  {
    id:    "login",
    label: "Login report",
    icon:  "↗",
    iconStyle: {
      fontSize:   15,
      fontWeight: 700,
      color:      "#fff",
      background: T.text,
      borderRadius: "50%",
      width:      28,
      height:     28,
      display:    "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    color: T.text,
    soft:  T.text,
    border: T.text,
    dark:  true,
  },
];

function Tile({ tile, onOpen }) {
  const [hov, setHov] = useState(false);

  const isDark = tile.dark;

  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onOpen(tile.id)}
      style={{
        display:      "inline-flex",
        alignItems:   "center",
        gap:          8,
        padding:      "9px 18px",
        background:   isDark
          ? (hov ? "#2D3148" : T.text)
          : (hov ? T.bg || "#F5F6FA" : T.card),
        border:       `1.5px solid ${isDark ? T.text : T.border}`,
        borderRadius: 10,
        boxShadow:    hov ? T.shadowHover : T.shadow,
        transform:    hov ? "translateY(-1px)" : "translateY(0)",
        transition:   "all .18s ease",
        cursor:       "pointer",
        fontFamily:   T.font,
        textAlign:    "left",
      }}
    >
      {/* Icon */}
      {tile.iconStyle ? (
        <span style={{ ...tile.iconStyle }}>{tile.icon}</span>
      ) : (
        <span style={{ fontSize: 15 }}>{tile.icon}</span>
      )}

      {/* Label */}
      <span style={{
        fontSize:   13,
        fontWeight: 600,
        color:      isDark ? "#fff" : T.text,
        whiteSpace: "nowrap",
      }}>
        {tile.label}
      </span>
    </button>
  );
}

export default function QuickAccess({ onOpen }) {
  return (
    <div style={{
      display:      "flex",
      alignItems:   "center",
      gap:          8,
      marginBottom: 20,
      flexWrap:     "wrap",
    }}>
      {TILES.map(t => (
        <Tile key={t.id} tile={t} onOpen={onOpen} />
      ))}
    </div>
  );
}