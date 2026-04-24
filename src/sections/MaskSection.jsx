import React from "react";
import SectionCard from "../components/SectionCard.jsx";
import HeatmapPanel from "../components/HeatmapPanel.jsx";

export default function MaskSection({ tokens, unmaskedWeights, maskedWeights, beginnerMode }) {
  return (
    <SectionCard
      title="Masked Attention"
      subtitle={
        beginnerMode
          ? "Causal masking prevents tokens from attending to future tokens."
          : "Causal attention adds a mask so each token only attends to itself and previous tokens."
      }
      beginnerMode={beginnerMode}
    >
      <div style={{ display: "grid", gap: 18 }}>
        <div className="chart-grid" style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))" }}>
          <HeatmapPanel title="Unmasked attention weights" z={unmaskedWeights} xLabels={tokens} yLabels={tokens} valueLabel="weight" expandable compact />
          <HeatmapPanel title="Causal masked attention weights" z={maskedWeights} xLabels={tokens} yLabels={tokens} valueLabel="weight" expandable compact />
        </div>
        <div style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.6 }}>
          Masked entries above the diagonal are blocked before softmax. This prevents tokens from attending to future positions.
        </div>
      </div>
    </SectionCard>
  );
}
