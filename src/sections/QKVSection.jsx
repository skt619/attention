import React from "react";
import SectionCard from "../components/SectionCard.jsx";
import MatrixTable from "../components/MatrixTable.jsx";

export default function QKVSection({ tokens, inputX, Q, K, V, beginnerMode, selectedToken }) {
  const viewMap = { Q, K, V };
  return (
    <SectionCard
      title="Query, Key, Value Projections"
      subtitle={
        beginnerMode
          ? "The same input vectors are projected into Q, K, and V spaces so attention can compare and combine information."
          : "Q = X_input W_Q, K = X_input W_K, V = X_input W_V. Queries search, keys match, and values carry the information that attention mixes."
      }
      beginnerMode={beginnerMode}
    >
      <div style={{ display: "grid", gap: 18 }}>
        <div style={{ display: "grid", gap: 18 }}>
          <MatrixTable
            title="Position-adjusted input X_input"
            tokens={tokens}
            matrix={inputX}
            explanation="This input matrix is used to compute Q, K, and V."
            selectedRow={selectedToken}
          />
          <div className="chart-grid" style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            {Object.entries(viewMap).map(([label, matrix]) => (
              <MatrixTable
                key={label}
                title={`${label} matrix`}
                tokens={tokens}
                matrix={matrix}
                explanation={`Showing the ${label} projection for each token.`}
                selectedRow={selectedToken}
              />
            ))}
          </div>
        </div>
        <div style={{ color: "#cbd5e1" }}>
          {selectedToken != null && (
            <div>
              Selected token <strong>{tokens[selectedToken]}</strong> has query, key, and value vectors highlighted above.
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
