const mathSteps = [
  {
    title: "Token embeddings",
    sectionId: "input-embeddings",
    formulas: [String.raw`X \in \mathbb{R}^{n \times d_{\text{model}}}`],
    explanation:
      "Each token becomes a vector of length d_model. The matrix X stacks those token vectors row by row.",
    beginnerExplanation: "Each word becomes a row of numbers.",
    lookFor: "See the base embedding matrix and the highlighted selected-token row.",
  },
  {
    title: "Positional encoding",
    sectionId: "positional-encoding",
    formulas: [
      String.raw`X_{\text{input}} = X + PE`,
      String.raw`PE(pos,2i)=\sin\left(\frac{pos}{10000^{2i/d_{\text{model}}}}\right)`,
      String.raw`PE(pos,2i+1)=\cos\left(\frac{pos}{10000^{2i/d_{\text{model}}}}\right)`,
    ],
    explanation:
      "Positional encoding injects order information into token representations before Q, K, and V are computed.",
    beginnerExplanation: "This adds word-order information so the model can tell first, middle, and last tokens apart.",
    lookFor: "Compare X with X_input and the positional encoding matrix.",
  },
  {
    title: "Query, Key, Value",
    sectionId: "qkv",
    formulas: [
      String.raw`Q = X_{\text{input}} W_Q,\quad K = X_{\text{input}} W_K,\quad V = X_{\text{input}} W_V`,
    ],
    explanation:
      "Q asks what a token is looking for, K describes what a token offers, and V carries the information that will be mixed.",
    beginnerExplanation: "Queries search, keys match, and values carry the information forward.",
    lookFor: "Watch the selected token stay highlighted across Q, K, and V.",
  },
  {
    title: "Raw dot-product scores",
    sectionId: "raw-scores",
    formulas: [String.raw`S = QK^T`, String.raw`S_{ij} = q_i \cdot k_j`],
    explanation:
      "Each query token is compared against every key token using a dot product.",
    beginnerExplanation: "This compares every token with every other token.",
    lookFor: "Use the raw score heatmap and table to inspect one query-key match.",
  },
  {
    title: "Scaled attention scores",
    sectionId: "scaled-scores",
    formulas: [String.raw`\tilde{S} = \frac{QK^T}{\sqrt{d_k}}`],
    explanation:
      "Scaling prevents large dot products from making softmax too extreme.",
    beginnerExplanation: "This shrinks large scores so the next step behaves more smoothly.",
    lookFor: "Compare raw and scaled heatmaps side by side.",
  },
  {
    title: "Softmax attention weights",
    sectionId: "attention-weights",
    formulas: [
      String.raw`A = \operatorname{softmax}(\tilde{S})`,
      String.raw`A = \operatorname{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)`,
    ],
    explanation:
      "Softmax turns each score row into probabilities that sum to 1.",
    beginnerExplanation: "This turns scores into probabilities.",
    lookFor: "Watch how the selected token's attention row sums to 1.",
  },
  {
    title: "Weighted output",
    sectionId: "attention-output",
    formulas: [String.raw`O = AV`, String.raw`o_i = \sum_j A_{ij}v_j`],
    explanation:
      "The output vector for each token is a weighted combination of value vectors.",
    beginnerExplanation: "This mixes information from all tokens using the attention weights.",
    lookFor: "Use the contribution chart to see which value vectors shape the selected output.",
  },
  {
    title: "Multi-head attention",
    sectionId: "multi-head",
    formulas: [
      String.raw`\text{head}_h = \operatorname{Attention}(Q_h,K_h,V_h)`,
      String.raw`\operatorname{MultiHead}(Q,K,V)=\operatorname{Concat}(\text{head}_1,\dots,\text{head}_H)W_O`,
    ],
    explanation:
      "Multiple heads let the model learn different token relationships in parallel.",
    beginnerExplanation: "Several attention heads can notice different patterns at the same time.",
    lookFor: "Compare per-head heatmaps and the head similarity matrix.",
  },
];

export default mathSteps;
