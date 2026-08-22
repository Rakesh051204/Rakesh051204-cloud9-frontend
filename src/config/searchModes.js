// src/config/searchModes.js
export const SEARCH_MODES = [
  { id: "fast", label: "Fast", description: "Quick answers, single search pass" },
  { id: "balanced", label: "Balanced", description: "Multi-query search with light reranking" },
  { id: "quality", label: "Quality", description: "Multi-query search with full Voyage reranking" },
];