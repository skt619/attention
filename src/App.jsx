import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import TopNavbar from "./components/TopNavbar.jsx";
import InputSection from "./sections/InputSection.jsx";
import EmbeddingSection from "./sections/EmbeddingSection.jsx";
import QKVSection from "./sections/QKVSection.jsx";
import ScoreSection from "./sections/ScoreSection.jsx";
import ScaledScoreSection from "./sections/ScaledScoreSection.jsx";
import WeightSection from "./sections/WeightSection.jsx";
import OutputSection from "./sections/OutputSection.jsx";
import MultiHeadSection from "./sections/MultiHeadSection.jsx";
import TemperatureSection from "./sections/TemperatureSection.jsx";
import PositionalSection from "./sections/PositionalSection.jsx";
import MaskSection from "./sections/MaskSection.jsx";
import ExperimentSection from "./sections/ExperimentSection.jsx";
import SummarySection from "./sections/SummarySection.jsx";
import TokenInspector from "./components/TokenInspector.jsx";
import { tokensFromText } from "./lib/tokenUtils.js";
import {
  addMatrices,
  attention,
  makeCausalMask,
  makeTokenEmbeddings,
  positionalEncoding,
  projectQKV,
  splitHeads,
  validHeadOptionsForDModel,
} from "./lib/attentionMath.js";
import {
  average,
  attentionEntropy,
  diversityScore,
  headSimilarityMatrix,
  maxWeight,
  rowSumValues,
  sparsityMetric,
  strongestAttentionPair,
} from "./lib/metrics.js";
import {
  temperatureSweep,
  positionalEncodingComparison,
  headDiversity,
} from "./lib/experiments.js";
import "./index.css";

const responsiveStatsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 12,
};

function StatCard({ label, value }) {
  return (
    <div
      style={{
        background: "rgba(15,23,42,0.85)",
        border: "1px solid #334155",
        borderRadius: 16,
        padding: 14,
      }}
    >
      <div style={{ color: "#cbd5e1", marginBottom: 8, fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.15 }}>{value}</div>
    </div>
  );
}

export default function App() {
  const [tokenText, setTokenText] = useState("the, black, hole, is, massive");
  const [dModel, setDModel] = useState(8);
  const [temperature, setTemperature] = useState(1.0);
  const [usePositional, setUsePositional] = useState(true);
  const [numHeads, setNumHeads] = useState(2);
  const [causalMask, setCausalMask] = useState(false);
  const [selectedToken, setSelectedToken] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarSection, setSidebarSection] = useState("controls");
  const [beginnerMode, setBeginnerMode] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [activeSection, setActiveSection] = useState("input-tokens");

  const tokens = useMemo(() => tokensFromText(tokenText), [tokenText]);
  const validHeadOptions = useMemo(() => validHeadOptionsForDModel(dModel), [dModel]);
  const activeNumHeads = validHeadOptions.includes(numHeads) ? numHeads : validHeadOptions[0];

  useEffect(() => {
    if (selectedToken >= tokens.length) {
      setSelectedToken(Math.max(0, tokens.length - 1));
    }
  }, [tokens, selectedToken]);

  useEffect(() => {
    if (validHeadOptions.length && !validHeadOptions.includes(numHeads)) {
      setNumHeads(validHeadOptions[0]);
    }
  }, [numHeads, validHeadOptions]);

  const data = useMemo(() => {
    if (tokens.length < 2 || !activeNumHeads) return null;

    const embed = makeTokenEmbeddings(tokens, dModel);
    const pe = positionalEncoding(tokens.length, dModel);
    const X = usePositional ? addMatrices(embed, pe) : embed;
    const { Q, K, V } = projectQKV(X, dModel, 7);
    const mask = causalMask ? makeCausalMask(tokens.length) : null;
    const attentionResult = attention(Q, K, V, { temperature, scale: true, mask });
    const unmaskedResult = attention(Q, K, V, { temperature, scale: true, mask: null });
    const unscaledResult = attention(Q, K, V, { temperature, scale: false, mask: null });

    const qHeads = splitHeads(Q, activeNumHeads);
    const kHeads = splitHeads(K, activeNumHeads);
    const vHeads = splitHeads(V, activeNumHeads);

    const headResults = qHeads.map((qh, index) => {
      if (!kHeads[index] || !vHeads[index]) return null;
      const result = attention(qh, kHeads[index], vHeads[index], { temperature, scale: true, mask });
      const entropies = attentionEntropy(result.weights);
      const sparsity = sparsityMetric(result.weights, 0.05);
      return {
        ...result,
        entropy: average(entropies),
        sparsity: sparsity.sparsity,
      };
    }).filter(Boolean);

    const rowSums = rowSumValues(attentionResult.weights);
    const entropies = attentionEntropy(attentionResult.weights);
    const avgEntropy = average(entropies);
    const sparsity = sparsityMetric(attentionResult.weights, 0.05);
    const maxAttention = maxWeight(attentionResult.weights);
    const strongest = strongestAttentionPair(attentionResult.weights, tokens);
    const headSimilarity = headSimilarityMatrix(headResults.map((head) => head.weights));
    const diversity = diversityScore(headSimilarity);

    return {
      embed,
      pe,
      X,
      Q,
      K,
      V,
      attention: attentionResult,
      unmasked: unmaskedResult,
      unscaled: unscaledResult,
      headResults,
      rowSums,
      entropies,
      avgEntropy,
      sparsity,
      maxAttention,
      strongest,
      headSimilarity,
      diversity,
    };
  }, [tokens, dModel, activeNumHeads, temperature, usePositional, causalMask]);

  const averageHeadSimilarity = useMemo(() => {
    if (!data?.headSimilarity) return 0;
    const matrix = data.headSimilarity;
    const n = matrix.length;
    if (n < 2) return 0;
    let sum = 0;
    let count = 0;
    for (let i = 0; i < n; i += 1) {
      for (let j = i + 1; j < n; j += 1) {
        sum += matrix[i][j];
        count += 1;
      }
    }
    return count ? sum / count : 0;
  }, [data]);

  const experimentData = useMemo(() => {
    if (!data) return [];
    return temperatureSweep(tokens, dModel, activeNumHeads, [0.25, 0.5, 1, 2, 5], usePositional, causalMask);
  }, [data, tokens, dModel, activeNumHeads, usePositional, causalMask]);

  const positionalComparison = useMemo(() => {
    if (!data) return null;
    return positionalEncodingComparison(tokens, dModel, temperature, causalMask);
  }, [data, tokens, dModel, temperature, causalMask]);

  const diversityData = useMemo(() => {
    if (!data) return [];
    return headDiversity(tokens, dModel, temperature, validHeadOptions, usePositional, causalMask);
  }, [data, tokens, dModel, temperature, validHeadOptions, usePositional, causalMask]);

  const navItems = useMemo(() => [
    { id: "input-tokens", label: "Input Tokens" },
    { id: "input-embeddings", label: "Input Embeddings" },
    { id: "qkv", label: "Q/K/V" },
    { id: "raw-scores", label: "Raw Scores" },
    { id: "scaled-scores", label: "Scaled Scores" },
    { id: "attention-weights", label: "Attention Weights" },
    { id: "attention-output", label: "Attention Output" },
    { id: "multi-head", label: "Multi-Head" },
    { id: "temperature", label: "Temperature" },
    { id: "positional-encoding", label: "Positional Encoding" },
    { id: "masked-attention", label: "Masked Attention" },
    { id: "experiment-mode", label: "Experiment Mode" },
    { id: "research-summary", label: "Research Summary" },
  ], []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visibleEntries.length > 0) {
          setActiveSection(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-96px 0px -60% 0px",
        threshold: [0.1, 0.4, 0.7],
      }
    );

    navItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [navItems]);

  if (!data) {
    return (
      <div style={{ color: "white", padding: 30 }}>
        Please enter at least two tokens and choose a number of heads that divides d_model evenly.
      </div>
    );
  }

  const summary = `The input sentence contains ${tokens.length} tokens with d_model=${dModel}. Using ${activeNumHeads} attention heads, temperature ${temperature.toFixed(3)}, positional encoding ${usePositional ? "enabled" : "disabled"}, and ${causalMask ? "causal masking" : "no masking"}, the average attention entropy is ${data.avgEntropy.toFixed(3)} and sparsity is ${data.sparsity.sparsity.toFixed(3)}. The head diversity score is ${data.diversity.toFixed(3)}. The strongest attention pair is ${data.strongest.query} → ${data.strongest.key} (${data.strongest.value.toFixed(3)}).`;

  const topNavHeight = 86;

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top, #0f172a, #020617 55%)", color: "white", fontFamily: "Inter, system-ui, sans-serif" }}>
      <TopNavbar items={navItems} activeId={activeSection} onNavigate={(id) => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }} />
      <div style={{ display: "flex", minHeight: "100vh", paddingTop: topNavHeight }}>
        <Sidebar
          open={sidebarOpen}
          topOffset={topNavHeight}
          onToggle={() => setSidebarOpen((value) => !value)}
          section={sidebarSection}
          onSectionChange={setSidebarSection}
          controls={{ tokenText, temperature, dModel, numHeads: activeNumHeads, headOptions: validHeadOptions, usePositional, causalMask }}
          onControlsChange={(changes) => {
            if (changes.tokenText !== undefined) setTokenText(changes.tokenText);
            if (changes.temperature !== undefined) setTemperature(changes.temperature);
            if (changes.dModel !== undefined) setDModel(changes.dModel);
            if (changes.numHeads !== undefined) setNumHeads(changes.numHeads);
            if (changes.usePositional !== undefined) setUsePositional(changes.usePositional);
            if (changes.causalMask !== undefined) setCausalMask(changes.causalMask);
          }}
          beginnerMode={beginnerMode}
          onBeginnerToggle={setBeginnerMode}
          activeStep={activeStep}
          onStepChange={setActiveStep}
        />

        <main style={{ flex: 1, minWidth: 0 }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", padding: 32, display: "grid", gap: 28 }}>
            <header style={{ display: "grid", gap: 16 }}>
              <div>
                <h1 style={{ fontSize: 48, margin: 0 }}>Self-Attention Tutorial</h1>
                <p style={{ color: "#cbd5e1", maxWidth: 920, fontSize: 18, lineHeight: 1.7 }}>
                  Explore the full attention pipeline from tokens to embeddings, Q/K/V projections, raw scores, scaled attention, softmax weights, and weighted outputs. Compare heads, temperature, positional encoding, and masking in an interactive math laboratory.
                </p>
              </div>
              <div style={responsiveStatsGrid}>
                <StatCard label="Tokens" value={tokens.length} />
                <StatCard label="d_model" value={dModel} />
                <StatCard label="Temperature" value={temperature.toFixed(2)} />
                <StatCard label="Heads" value={activeNumHeads} />
                <StatCard label="Avg entropy" value={data.avgEntropy.toFixed(3)} />
                <StatCard label="Sparsity" value={data.sparsity.sparsity.toFixed(3)} />
                <StatCard label="Diversity" value={data.diversity.toFixed(3)} />
                <StatCard label="Strongest pair" value={`${data.strongest.query} → ${data.strongest.key}`} />
                <StatCard label="Position" value={usePositional ? "Enabled" : "Disabled"} />
                <StatCard label="Masking" value={causalMask ? "Causal" : "None"} />
              </div>
            </header>

            <div style={{ display: "grid", gap: 24 }}>
              <div id="input-tokens" style={{ scrollMarginTop: "112px" }}>
                <InputSection
                  tokenText={tokenText}
                  onTokenTextChange={setTokenText}
                  tokens={tokens}
                  selectedToken={selectedToken}
                  onSelectToken={setSelectedToken}
                  beginnerMode={beginnerMode}
                />
              </div>
              <div id="input-embeddings" style={{ scrollMarginTop: "112px" }}>
                <TokenInspector
                  selectedIndex={selectedToken}
                  tokens={tokens}
                  data={data}
                  temperature={temperature}
                  causalMask={causalMask}
                />
                <EmbeddingSection
                  tokens={tokens}
                  embed={data.embed}
                  inputX={data.X}
                  usePositional={usePositional}
                  selectedToken={selectedToken}
                  beginnerMode={beginnerMode}
                />
              </div>
              <div id="qkv" style={{ scrollMarginTop: "112px" }}>
                <QKVSection
                  tokens={tokens}
                  inputX={data.X}
                  Q={data.Q}
                  K={data.K}
                  V={data.V}
                  beginnerMode={beginnerMode}
                  selectedToken={selectedToken}
                />
              </div>
              <div id="raw-scores" style={{ scrollMarginTop: "112px" }}>
                <ScoreSection
                  tokens={tokens}
                  rawScores={data.attention.rawScores}
                  Q={data.Q}
                  K={data.K}
                  selectedToken={selectedToken}
                  beginnerMode={beginnerMode}
                />
              </div>
              <div id="scaled-scores" style={{ scrollMarginTop: "112px" }}>
                <ScaledScoreSection
                  tokens={tokens}
                  rawScores={data.attention.rawScores}
                  scaledScores={data.attention.scaledScores}
                  Q={data.Q}
                  K={data.K}
                  selectedToken={selectedToken}
                  beginnerMode={beginnerMode}
                />
              </div>
              <div id="attention-weights" style={{ scrollMarginTop: "112px" }}>
                <WeightSection
                  tokens={tokens}
                  scaledScores={data.attention.scaledScores}
                  weights={data.attention.weights}
                  selectedToken={selectedToken}
                  beginnerMode={beginnerMode}
                />
              </div>
              <div id="attention-output" style={{ scrollMarginTop: "112px" }}>
                <OutputSection
                  tokens={tokens}
                  weights={data.attention.weights}
                  V={data.V}
                  output={data.attention.output}
                  selectedToken={selectedToken}
                  beginnerMode={beginnerMode}
                />
              </div>
              <div id="multi-head" style={{ scrollMarginTop: "112px" }}>
                <MultiHeadSection tokens={tokens} headResults={data.headResults} headSimilarity={data.headSimilarity} diversity={data.diversity} beginnerMode={beginnerMode} />
              </div>
              <div id="temperature" style={{ scrollMarginTop: "112px" }}>
                <TemperatureSection experimentData={experimentData} beginnerMode={beginnerMode} />
              </div>
              <div id="positional-encoding" style={{ scrollMarginTop: "112px" }}>
                <PositionalSection
                  tokens={tokens}
                  embeddingWithPos={addMatrices(data.embed, data.pe)}
                  positionalEncoding={data.pe}
                  positionalComparison={positionalComparison}
                  beginnerMode={beginnerMode}
                />
              </div>
              <div id="masked-attention" style={{ scrollMarginTop: "112px" }}>
                <MaskSection
                  tokens={tokens}
                  unmaskedWeights={data.unmasked.weights}
                  maskedWeights={attention(data.Q, data.K, data.V, { temperature, scale: true, mask: makeCausalMask(tokens.length) }).weights}
                  beginnerMode={beginnerMode}
                />
              </div>
              <div id="experiment-mode" style={{ scrollMarginTop: "112px" }}>
                <ExperimentSection
                  temperatureData={experimentData}
                  positionalComparison={positionalComparison}
                  diversityData={diversityData}
                  beginnerMode={beginnerMode}
                />
              </div>
              <div id="research-summary" style={{ scrollMarginTop: "112px" }}>
                <SummarySection summary={summary} beginnerMode={beginnerMode} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
