import { useState } from "react"

export default function App() {
  const [query, setQuery] = useState("")
  const [answer, setAnswer] = useState("")
  const [sources, setSources] = useState([])
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async (q) => {
    const searchQuery = q || query
    if (!searchQuery.trim()) return
    setLoading(true)
    setError("")
    setAnswer("")
    setSources([])
    setRelated([])
    try {
      const response = await fetch("https://cloud9-api-2.onrender.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery.trim() })
      })
      const data = await response.json()
      if (data.error) {
        setError(data.error)
      } else {
        setAnswer(data.answer)
        setSources(data.sources || [])
        setRelated(data.relatedQuestions || [])
      }
    } catch (err) {
      setError("Failed to connect to backend. Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "sans-serif", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: "0.5rem" }}>☁️ Cloud9</h1>
        <p style={{ textAlign: "center", color: "#888", marginBottom: "2rem" }}>Ask anything. Get instant answers.</p>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Ask anything..."
            style={{ flex: 1, padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid #333", background: "#111", color: "#fff", fontSize: "1rem" }}
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            style={{ padding: "0.75rem 1.5rem", borderRadius: "8px", background: "#6366f1", color: "#fff", border: "none", cursor: "pointer", fontSize: "1rem" }}
          >
            {loading ? "..." : "Search"}
          </button>
        </div>

        {error && <p style={{ color: "#f87171" }}>{error}</p>}

        {answer && (
          <>
            {/* Answer */}
            <div style={{ background: "#111", border: "1px solid #222", borderRadius: "12px", padding: "1.5rem", whiteSpace: "pre-wrap", lineHeight: "1.8", marginBottom: "1.5rem" }}>
              {answer}
            </div>

            {/* Sources */}
            {sources.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ color: "#888", fontSize: "0.85rem", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Sources</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {sources.map((s, i) => (
                    
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", padding: "0.5rem 0.75rem", color: "#a5b4fc", fontSize: "0.85rem", textDecoration: "none" }}
                    >
                      [{i + 1}] {s.title}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Related Questions */}
            {related.length > 0 && (
              <div>
                <h3 style={{ color: "#888", fontSize: "0.85rem", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Related</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {related.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => { setQuery(q); handleSearch(q); }}
                      style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", padding: "0.75rem 1rem", color: "#fff", fontSize: "0.9rem", textAlign: "left", cursor: "pointer" }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}