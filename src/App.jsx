import { useState } from "react"

export default function App() {
  const [query, setQuery] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError("")
    setAnswer("")
    try {
      const response = await fetch("https://Stoic-api-2.onrender.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() })
      })
      const data = await response.json()
      if (data.error) {
        setError(data.error)
      } else {
        setAnswer(data.answer)
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
        <h1 style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: "0.5rem" }}>? Stoic</h1>
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
            onClick={handleSearch}
            disabled={loading}
            style={{ padding: "0.75rem 1.5rem", borderRadius: "8px", background: "#6366f1", color: "#fff", border: "none", cursor: "pointer", fontSize: "1rem" }}
          >
            {loading ? "..." : "Ask"}
          </button>
        </div>
        {error && <p style={{ color: "#f87171" }}>{error}</p>}
        {answer && (
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: "12px", padding: "1.5rem", whiteSpace: "pre-wrap", lineHeight: "1.7" }}>
            {answer}
          </div>
        )}
      </div>
    </div>
  )
}
