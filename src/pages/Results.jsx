import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

const API_BASE = 'https://cloud9-api-2.onrender.com'

export default function Results() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || ''
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState([])
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchAnswer = (q) => {
    setLoading(true)
    setError('')
    setAnswer('')
    setSources([])
    setRelated([])
    fetch(`${API_BASE}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q })
    })
      .then(res => res.json())
      .then(data => {
        setAnswer(data.answer || 'No answer')
        setSources(data.sources || [])
        setRelated(data.relatedQuestions || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    if (query) fetchAnswer(query)
  }, [query])

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>← Back</button>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>{query}</h2>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ color: '#888', fontSize: '1rem', padding: '2rem 0' }}>🔍 Searching the web...</div>
        )}

        {/* Error */}
        {error && <p style={{ color: '#f87171' }}>Error: {error}</p>}

        {/* Answer */}
        {answer && (
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '1.5rem', lineHeight: '1.8', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
            {answer}
          </div>
        )}

        {/* Sources */}
        {sources.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sources</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {sources.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', padding: '0.5rem 0.75rem', color: '#a5b4fc', fontSize: '0.85rem', textDecoration: 'none' }}>
                  [{i + 1}] {s.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Related Questions */}
        {related.length > 0 && (
          <div>
            <h3 style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Related</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {related.map((q, i) => (
                <button key={i} onClick={() => navigate(`/search?q=${encodeURIComponent(q)}`)} style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', textAlign: 'left', cursor: 'pointer' }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}