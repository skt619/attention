import React from "react";
import SectionCard from "../components/SectionCard.jsx";
import LineChartPanel from "../components/LineChartPanel.jsx";

export default function TemperatureSection({ experimentData, beginnerMode }) {
  const traceEntropy = {
    x: experimentData.map((point) => point.temperature),
    y: experimentData.map((point) => point.avgEntropy),
    type: "scatter",
    mode: "lines+markers",
    name: "Entropy",
    marker: { color: "#38bdf8" },
  };
  const traceSparsity = {
    x: experimentData.map((point) => point.temperature),
    y: experimentData.map((point) => point.sparsity),
    type: "scatter",
    mode: "lines+markers",
    name: "Sparsity",
    marker: { color: "#a855f7" },
  };
  const traceMax = {
    x: experimentData.map((point) => point.temperature),
    y: experimentData.map((point) => point.maxWeight),
    type: "scatter",
    mode: "lines+markers",
    name: "Max weight",
    marker: { color: "#22d3ee" },
  };

  return (
    <SectionCard
      title="Temperature Experiment"
      subtitle={
        beginnerMode
          ? "Temperature controls how sharp or smooth the attention probabilities are."
          : "Lower temperature sharpens attention distributions; higher temperature smooths them."
      }
      beginnerMode={beginnerMode}
    >
      <div className="chart-grid" style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
        <LineChartPanel title="Entropy vs temperature" traces={[traceEntropy]} xLabel="Temperature" yLabel="Entropy" />
        <LineChartPanel title="Sparsity vs temperature" traces={[traceSparsity]} xLabel="Temperature" yLabel="Sparsity" />
        <LineChartPanel title="Max attention weight vs temperature" traces={[traceMax]} xLabel="Temperature" yLabel="Max weight" />
        <div style={{ color: "#cbd5e1", fontSize: 14, gridColumn: "1 / -1" }}>
          Each row above shows how the average attention entropy, the fraction of near-zero weights, and the largest weight change as temperature adjusts.
        </div>
      </div>
    </SectionCard>
  );
}
