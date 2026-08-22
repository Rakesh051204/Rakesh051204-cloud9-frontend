// src/data/mockNewsData.js

// --- Swap point for real data later ---
// Replace the body of this function with a real Tavily-backed backend call, e.g.:
//   const res = await fetch(`/api/discover?tab=${tab}&page=${page}`);
//   return res.json();
// Keep the same return shape { items, hasMore } and nothing else needs to change.
export async function fetchDiscoverPage(tab, page, pageSize = 10) {
  // simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  const totalPagesByTab = { forYou: 6, top: 4, topics: 8 };
  const maxPages = totalPagesByTab[tab] ?? 5;

  const items = Array.from({ length: pageSize }, (_, i) => {
    const id = `${tab}-${page}-${i}`;
    return {
      id,
      tab,
      title: `${labelForTab(tab)} story #${(page - 1) * pageSize + i + 1}`,
      source: pickSource(id),
      snippet:
        "Placeholder snippet text standing in for a real summary pulled from the source article. Replace via fetchDiscoverPage.",
      timestamp: relativeTime(i + page),
      imageSeed: id,
    };
  });

  return {
    items,
    hasMore: page < maxPages,
  };
}

function labelForTab(tab) {
  if (tab === "forYou") return "For You";
  if (tab === "top") return "Top";
  return "Topics";
}

function pickSource(seed) {
  const sources = ["Reuters", "The Verge", "Bloomberg", "TechCrunch", "AP News"];
  const idx = Math.abs(hashCode(seed)) % sources.length;
  return sources[idx];
}

function relativeTime(n) {
  const hours = (n * 3) % 23;
  return hours <= 1 ? "1h ago" : `${hours}h ago`;
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}