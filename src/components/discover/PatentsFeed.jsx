import { useEffect, useState } from "react";

export default function PatentsFeed() {
  const [patents, setPatents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/discover/patents")
      .then((r) => r.json())
      .then((data) => setPatents(data.patents || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-[#888]">Loading patents...</p>;

  return (
    <div className="space-y-4">
      <p className="text-xs text-[#666] mb-2">
        Sample data — live patent search APIs require paid access
      </p>
      {patents.map((p, i) => (
        <div key={i} className="rounded-xl border border-[#222] p-4">
          <div className="flex justify-between items-start mb-2">
            <p className="text-base font-serif">{p.title}</p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                p.status === "Granted"
                  ? "bg-green-900/40 text-green-400"
                  : "bg-yellow-900/40 text-yellow-400"
              }`}
            >
              {p.status}
            </span>
          </div>
          <p className="text-xs text-[#666] mb-2">
            {p.assignee} · Filed {new Date(p.filingDate).toLocaleDateString()}
          </p>
          <p className="text-sm text-[#aaa]">{p.abstract}</p>
        </div>
      ))}
    </div>
  );
}