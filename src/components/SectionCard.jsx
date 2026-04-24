import React from "react";

const cardStyle = {
  background: "rgba(15,23,42,0.85)",
  border: "1px solid #334155",
  borderRadius: 22,
  padding: 24,
  boxShadow: "0 18px 30px rgba(0,0,0,0.18)",
};

export default function SectionCard({ title, children, subtitle, beginnerMode = false }) {
  return (
    <section
      className={beginnerMode ? "section-card section-card--beginner" : "section-card"}
      style={{
        ...cardStyle,
        borderColor: beginnerMode ? "rgba(34,211,238,0.45)" : cardStyle.border.split(" ")[2],
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        {subtitle && (
          <p
            style={{
              color: beginnerMode ? "#dffbff" : "#cbd5e1",
              marginTop: 8,
              lineHeight: 1.6,
              background: beginnerMode ? "rgba(34,211,238,0.08)" : "transparent",
              border: beginnerMode ? "1px solid rgba(34,211,238,0.22)" : "1px solid transparent",
              borderRadius: 12,
              padding: beginnerMode ? "10px 12px" : 0,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
