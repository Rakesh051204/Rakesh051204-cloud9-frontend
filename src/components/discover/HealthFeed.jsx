import { useEffect, useState } from "react";

export default function HealthFeed() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/discover/news?category=health")
      .then((r) => r.json())
      .then((data) => setArticles(data.articles || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-[#888]">Loading health news...</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {articles.map((a, i) => (
        
          key={i}
          href={a.url}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-[#222] overflow-hidden hover:border-[#444] transition-colors"
        >
          {a.image && <img src={a.image} alt="" className="w-full h-36 object-cover" />}
          <div className="p-3">
            <p className="text-sm font-medium leading-snug mb-1">{a.title}</p>
            <p className="text-xs text-[#666]">{a.source}</p>
          </div>
        </a>
      ))}
    </div>
  );
}