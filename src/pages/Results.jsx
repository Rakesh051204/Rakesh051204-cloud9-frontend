import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { supabase } from '../supabase'

const API_BASE = 'http://localhost:3001'

export default function Results() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || ''

  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])

  useEffect(() => {
    if (query) {
      performSearch()
    }
    fetchHistory()
  }, [query])

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('searches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    if (data) setHistory(data)
  }

  const performSearch = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Search failed')
      }

      const data = await response.json()
      setAnswer(data.answer)

      // Save to Supabase
      await supabase.from('searches').insert({
        query: query,
        answer: data.answer
      })

      fetchHistory()

    } catch (err) {
      console.error('Search error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleNewSearch = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const newQuery = formData.get('query')
    if (newQuery?.trim()) {
      navigate(`/search?q=${encodeURIComponent(newQuery.trim())}`)
    }
  }

  return (
    <div style={{ display: 'flex', maxWidth: '1100px', margin: '0 auto', padding: '2rem', gap: '2rem' }}>
      
      {/* Left - Main Content */}
      <div style={{ flex: 1 }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: '#4f8eff',
            cursor: 'pointer',
            fontSize: '1rem',
            marginBottom: '2rem'
          }}
        >
          ← Back to Search
        </button>

        <form onSubmit={handleNewSearch} style={{ marginBottom: '2rem' }}>
          <input
            name="query"
            defaultValue={query}
            placeholder="Ask anything..."
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              background: '#0d1b35',
              border: '1px solid #1e3058',
              borderRadius: '8px',
              color: 'white'
            }}
          />
        </form>

        <h2 style={{ color: 'white', marginBottom: '1rem' }}>{query}</h2>

        {loading && (
          <div style={{ color: '#8b9ac0', padding: '2rem', textAlign: 'center' }}>
            🤔 Thinking...
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            color: '#fca5a5'
          }}>
            ⚠️ Error: {error}
          </div>
        )}

        {answer && !loading && (
          <div style={{
            background: '#111e3a',
            border: '1px solid #1e3058',
            borderRadius: '14px',
            padding: '1.5rem',
            color: '#f0f4ff'
          }}>
            <ReactMarkdown>{answer}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Right - Search History */}
      <div style={{ width: '250px' }}>
        <h3 style={{ color: '#8b9ac0', fontSize: '0.9rem', marginBottom: '1rem' }}>
          🕐 Recent Searches
        </h3>
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(`/search?q=${encodeURIComponent(item.query)}`)}
            style={{
              background: '#111e3a',
              border: '1px solid #1e3058',
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '0.5rem',
              cursor: 'pointer',
              color: '#c0cfff',
              fontSize: '0.85rem'
            }}
          >
            {item.query}
          </div>
        ))}
      </div>

    </div>
  )
}