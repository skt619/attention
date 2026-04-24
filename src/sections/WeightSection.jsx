import React, { useMemo } from "react";
import SectionCard from "../components/SectionCard.jsx";
import HeatmapPanel from "../components/HeatmapPanel.jsx";
import BarChartPanel from "../components/BarChartPanel.jsx";
import MatrixTable from "../components/MatrixTable.jsx";

export default function WeightSection({ tokens, scaledScores, weights, selectedToken, beginnerMode }) {
  const top = weights[selectedToken]
    .map((value, idx) => ({ token: tokens[idx], value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);

  const rowSums = useMemo(
    () => weights.map((row) => row.reduce((sum, value) => sum + value, 0)),
    [weights]
  );

  return (
    <SectionCard
      title="Attention Weights"
      subtitle={
        beginnerMode
          ? "Softmax turns each row into probabilities that add to 1."
          : "A = softmax((QK^T)/sqrt(d_k)). Each row of A is a probability distribution over the keys for one query token."
      }
      beginnerMode={beginnerMode}
    >
      <div style={{ display: "grid", gap: 24 }}>
        <div className="chart-grid" style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))" }}>
          <HeatmapPanel
            title="Scaled attention scores"
            z={scaledScores}
            xLabels={tokens}
            yLabels={tokens}
            valueLabel="score"
            selectedRow={selectedToken}
            selectedCol={selectedToken}
            expandable
            compact
          />
          <HeatmapPanel
            title="Attention weight matrix A"
            z={weights}
            xLabels={tokens}
            yLabels={tokens}
            valueLabel="weight"
            selectedRow={selectedToken}
            selectedCol={selectedToken}
            expandable
            compact
          />
        </div>
        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ color: "#cbd5e1", fontSize: 14 }}>
            Row sums should be 1 for every query after softmax.
          </div>
          <MatrixTable
            title="Row sum check"
            tokens={tokens}
            matrix={rowSums.map((value) => [value])}
            columnLabels={["sum"]}
            selectedRow={selectedToken}
            explanation="Each row is the sum of the attention weights for one query token."
          />
          <div style={{ color: "#cbd5e1", fontSize: 14 }}>
            Selected token <strong>{tokens[selectedToken]}</strong> attends most to:
          </div>
          <ul style={{ color: "#e2e8f0", paddingLeft: 18 }}>
            {top.map((item) => (
              <li key={item.token}>{`${item.token}: ${item.value.toFixed(3)}`}</li>
            ))}
          </ul>
          <BarChartPanel
            title={`Attention distribution for ${tokens[selectedToken]}`}
            x={tokens}
            y={weights[selectedToken]}
            xLabel="Key token"
            yLabel="Attention weight"
          />
        </div>
      </div>
    </SectionCard>
  );
}
