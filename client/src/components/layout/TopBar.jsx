// src/components/TopBar.jsx
import { useNavigate } from "react-router-dom";

export default function TopBar({ title, subtitle, breadcrumb, actionLabel, onAction }) {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "Admin";
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 24px", borderBottom: "1px solid #e2e8f0",
      background: "white", position: "sticky", top: 0, zIndex: 10
    }}>

      {/* Left */}
      <div>
        <h1 style={{ fontSize: "18px", fontWeight: 600, color: "#0f172a", margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: "13px", color: "#94a3b8", margin: "2px 0 0" }}>{subtitle}</p>}
        {breadcrumb && (
          <p style={{ fontSize: "12px", color: "#94a3b8", margin: "2px 0 0" }}>
            {breadcrumb.map((b, i) => (
              <span key={i}>
                {i > 0 && <span style={{ margin: "0 4px", color: "#cbd5e1" }}>→</span>}
                <span style={{ color: i === breadcrumb.length - 1 ? "#64748b" : "#3b82f6" }}>{b}</span>
              </span>
            ))}
          </p>
        )}
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        
        {/* Modules button — எல்லா page-லயும் இருக்கும் */}
        <button
          onClick={() => navigate("/modules")}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 16px", fontSize: "13px", fontWeight: 500,
            color: "white", background: "#3b82f6", border: "none",
            borderRadius: "8px", cursor: "pointer"
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          Modules
        </button>

        {/* Action button (optional) — "+ New Lead", "+ Create User" etc */}
        {actionLabel && (
          <button
            onClick={onAction}
            style={{
              padding: "8px 16px", fontSize: "13px", fontWeight: 500,
              color: "white", background: "#0f172a", border: "none",
              borderRadius: "8px", cursor: "pointer"
            }}
          >
            + {actionLabel}
          </button>
        )}

        {/* Avatar */}
        <div style={{
          width: "36px", height: "36px", borderRadius: "50%",
          background: "#3b82f6", display: "flex", alignItems: "center",
          justifyContent: "center", color: "white", fontSize: "12px", fontWeight: 600
        }}>
          {initials}
        </div>
      </div>
    </div>
  );
}