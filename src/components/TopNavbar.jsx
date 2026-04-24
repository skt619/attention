import React from "react";

export default function TopNavbar({ items, activeId, onNavigate }) {
  return (
    <nav
      className="top-navbar"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        borderBottom: "1px solid rgba(51,65,85,0.85)",
        background: "rgba(7,12,26,0.96)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 14px 28px rgba(2,6,23,0.42)",
        padding: "10px 18px 12px",
      }}
    >
      <div
        className="top-navbar__inner"
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          overflowX: "auto",
          padding: "4px 2px",
          scrollbarWidth: "thin",
        }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={item.id === activeId ? "true" : undefined}
            onClick={() => onNavigate(item.id)}
            style={{
              whiteSpace: "nowrap",
              padding: "9px 13px",
              borderRadius: 999,
              border: item.id === activeId ? "1px solid #22d3ee" : "1px solid #334155",
              background: item.id === activeId ? "rgba(34,211,238,0.18)" : "rgba(15,23,42,0.74)",
              color: item.id === activeId ? "#ffffff" : "#cbd5e1",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              boxShadow: item.id === activeId ? "0 0 0 3px rgba(34,211,238,0.08)" : "none",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
