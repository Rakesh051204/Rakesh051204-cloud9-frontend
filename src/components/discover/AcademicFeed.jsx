import { useEffect, useState } from "react";

export default function AcademicFeed() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/discover/academic?q=artificial+intelligence")
      .then((r) => r.json())
      .then((data) => setPapers(data.entries || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-[#888]">Loading papers...</p>;

  return (
    <div className="space-y-4">
      {papers.map((p, i) => (
        <a key={i}
          href={p.link}
          target="_blank"
          rel="noreferrer"
          className="block rounded-xl border border-[#222] p-4 hover:border-[#444] transition-colors"
        >
          <p className="text-base font-serif mb-1">{p.title}</p>
          <p className="text-xs text-[#666] mb-2">
            {p.authors?.slice(0, 3).join(", ")}
            {p.authors?.length > 3 ? " et al." : ""} ·{" "}
            {new Date(p.published).toLocaleDateString()}
          </p>
          <p className="text-sm text-[#aaa] line-clamp-3">{p.summary}</p>
        </a>
      ))}
    </div>
  );
}