// src/components/Layout.jsx
import Sidebar from "../dashboards/Sidebar";
import TopBar from "../layout/TopBar";

export default function Layout({ title, subtitle, breadcrumb, actionLabel, onAction, children }) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      
      {/* LEFT: உங்கள் existing Sidebar — மாத்தவே வேண்டாம் */}
      <Sidebar />

      {/* RIGHT: TopBar + Page content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f8fafc" }}>
        
        <TopBar
          title={title}
          subtitle={subtitle}
          breadcrumb={breadcrumb}
          actionLabel={actionLabel}
          onAction={onAction}
        />

        <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {children}
        </main>

      </div>
    </div>
  );
}