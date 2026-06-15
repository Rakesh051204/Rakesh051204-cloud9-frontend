import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

const API_BASE = 'https://cloud9-api-2.onrender.com'

export default function Results() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || ''
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (query) {
      setLoading(true)
      fetch(`${API_BASE}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
        .then(res => res.json())
        .then(data => {
          setAnswer(data.answerText || 'No answer')
          setLoading(false)
        })
        .catch(err => {
          setError(err.message)
          setLoading(false)
        })
    }
  }, [query])

  return (
    <div style={{ maxWidth: 800, margin: '20px auto', padding: 20 }}>
      <button onClick={() => navigate('/')}>← Back</button>
      <h1>{query}</h1>
      {loading && <p>Searching...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {answer && <pre style={{ whiteSpace: 'pre-wrap' }}>{answer}</pre>}
    </div>
  )
}
