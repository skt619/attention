import React from "react";
import mathSteps from "../data/mathSteps.js";

const cardStyle = {
  background: "rgba(15,23,42,0.95)",
  border: "1px solid #334155",
  borderRadius: 20,
  padding: 18,
};

const fieldStyle = {
  width: "100%",
  borderRadius: 14,
  border: "1px solid #334155",
  background: "#020617",
  color: "#e5eefc",
  padding: "10px 12px",
  fontSize: 14,
};

const tabButtonStyle = (active) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 14px",
  borderRadius: 14,
  border: active ? "1px solid #22d3ee" : "1px solid #334155",
  background: active ? "rgba(34,211,238,0.14)" : "rgba(15,23,42,0.8)",
  color: "#e5eefc",
  cursor: "pointer",
  fontWeight: 700,
});

const badgeStyle = {
  display: "inline-grid",
  placeItems: "center",
  width: 26,
  height: 26,
  borderRadius: 8,
  background: "rgba(34,211,238,0.1)",
  color: "#67e8f9",
  fontSize: 12,
  fontWeight: 800,
  flexShrink: 0,
};

const collapsedButtonStyle = {
  width: "100%",
  minHeight: 52,
  padding: "9px 4px",
  borderRadius: 12,
  border: "1px solid #334155",
  background: "rgba(15,23,42,0.8)",
  color: "#e5eefc",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 800,
  lineHeight: 1.15,
};

export default function Sidebar({
  open,
  onToggle,
  section,
  onSectionChange,
  controls,
  onControlsChange,
  beginnerMode,
  onBeginnerToggle,
  activeStep,
  onStepChange,
  topOffset = 0,
}) {
  return (
    <div
      style={{
        width: open ? 340 : 84,
        transition: "width 0.25s ease",
        borderRight: "1px solid #334155",
        background: "rgba(2,6,23,0.96)",
        padding: 16,
        position: "sticky",
        top: topOffset,
        height: `calc(100vh - ${topOffset}px)`,
        overflowY: "auto",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: open ? "space-between" : "center",
          alignItems: "center",
          marginBottom: 18,
          gap: 10,
        }}
      >
        {open && (
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Attention Lab</div>
            <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 3 }}>Controls and math steps</div>
          </div>
        )}
        <button
          type="button"
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          onClick={onToggle}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #334155",
            background: "rgba(15,23,42,0.8)",
            color: "#e5eefc",
            cursor: "pointer",
            fontWeight: 800,
            width: open ? "auto" : "100%",
          }}
        >
          {open ? "<" : ">"}
        </button>
      </div>

      {open ? (
        <>
          <div style={{ ...cardStyle, padding: 12 }}>
            <div style={{ display: "grid", gap: 10 }}>
              <button type="button" onClick={() => onSectionChange("controls")} style={tabButtonStyle(section === "controls")}>
                <span style={badgeStyle}>C</span>
                <span>Controls</span>
              </button>
              <button type="button" onClick={() => onSectionChange("math")} style={tabButtonStyle(section === "math")}>
                <span style={badgeStyle}>M</span>
                <span>Math Steps</span>
              </button>
            </div>
          </div>

          {section === "controls" && (
            <div style={{ marginTop: 18, display: "grid", gap: 16 }}>
              <div style={cardStyle}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Input tokens</label>
                <input value={controls.tokenText} onChange={(e) => onControlsChange({ tokenText: e.target.value })} style={fieldStyle} />
                <div style={{ color: "#94a3b8", marginTop: 8 }}>Separate tokens with commas.</div>
              </div>

              <div style={cardStyle}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Temperature</label>
                <input
                  type="range"
                  min="0.25"
                  max="5"
                  step="0.01"
                  value={controls.temperature}
                  onChange={(e) => onControlsChange({ temperature: Number(e.target.value) })}
                  style={{ width: "100%" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <span style={{ color: "#cbd5e1" }}>0.25</span>
                  <span style={{ color: "#67e8f9" }}>{controls.temperature.toFixed(2)}</span>
                  <span style={{ color: "#cbd5e1" }}>5</span>
                </div>
              </div>

              <div style={cardStyle}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>d_model</label>
                <select value={controls.dModel} onChange={(e) => onControlsChange({ dModel: Number(e.target.value) })} style={fieldStyle}>
                  <option value={4}>4</option>
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={16}>16</option>
                </select>
              </div>

              <div style={cardStyle}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Heads</label>
                <select value={controls.numHeads} onChange={(e) => onControlsChange({ numHeads: Number(e.target.value) })} style={fieldStyle}>
                  {(controls.headOptions?.length ? controls.headOptions : [1]).map((heads) => (
                    <option key={heads} value={heads}>{heads}</option>
                  ))}
                </select>
              </div>

              <div style={cardStyle}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={controls.usePositional}
                    onChange={(e) => onControlsChange({ usePositional: e.target.checked })}
                  />
                  Add positional encoding
                </label>
                <div style={{ color: "#94a3b8", marginTop: 8 }}>Self-attention requires token order information.</div>
              </div>

              <div style={cardStyle}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={controls.causalMask}
                    onChange={(e) => onControlsChange({ causalMask: e.target.checked })}
                  />
                  Causal attention mask
                </label>
                <div style={{ color: "#94a3b8", marginTop: 8 }}>No token can attend to future tokens.</div>
              </div>

              <div style={cardStyle}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input type="checkbox" checked={beginnerMode} onChange={(e) => onBeginnerToggle(e.target.checked)} />
                  Beginner explanation mode
                </label>
                <div style={{ color: "#94a3b8", marginTop: 8 }}>Use simpler explanations and step guidance.</div>
              </div>
            </div>
          )}

          {section === "math" && (
            <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
              {mathSteps.map((step, index) => (
                <button
                  type="button"
                  key={step.title}
                  onClick={() => onStepChange(index)}
                  style={{
                    textAlign: "left",
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: activeStep === index ? "1px solid #22d3ee" : "1px solid #334155",
                    background: activeStep === index ? "rgba(34,211,238,0.14)" : "rgba(15,23,42,0.8)",
                    color: "#e5eefc",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Step {index + 1}</div>
                  <div style={{ fontWeight: 600 }}>{step.title}</div>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          <button
            type="button"
            aria-label="Open controls"
            onClick={() => {
              onSectionChange("controls");
              onToggle();
            }}
            style={collapsedButtonStyle}
          >
            Ctrl
          </button>
          <button
            type="button"
            aria-label="Open math steps"
            onClick={() => {
              onSectionChange("math");
              onToggle();
            }}
            style={collapsedButtonStyle}
          >
            Math
          </button>
        </div>
      )}
    </div>
  );
}
