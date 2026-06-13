import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = 'http://localhost:3001'

export default function ImageGen() {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateImage = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError('')
    setImageUrl('')

    try {
      const response = await fetch(`${API_BASE}/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() })
      })
      const data = await response.json()
      if (data.error) {
        setError(data.error)
      } else {
        setImageUrl(data.imageUrl)
      }
    } catch (err) {
      setError('Failed to generate image: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#060d1f', padding:'2rem', color:'white' }}>
      <div style={{ maxWidth:'800px', margin:'0 auto' }}>

        <button onClick={() => navigate('/')} style={{ background:'none', border:'none', color:'#4f8eff', cursor:'pointer', fontSize:'1rem', marginBottom:'2rem' }}>
          Back to Home
        </button>

        <h1 style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>🎨 Image Generation</h1>
        <p style={{ color:'#8b9ac0', marginBottom:'2rem' }}>Describe anything and Cloud9 will create it</p>

        <div style={{ display:'flex', gap:'1rem', marginBottom:'2rem' }}>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateImage()}
            placeholder="A futuristic city at night with neon lights..."
            style={{ flex:1, padding:'0.75rem 1rem', fontSize:'1rem', background:'#0d1b35', border:'1px solid #1e3058', borderRadius:'8px', color:'white', outline:'none' }}
          />
          <button
            onClick={generateImage}
            disabled={loading}
            style={{ padding:'0.75rem 1.5rem', background: loading ? '#1e3058' : '#4f8eff', border:'none', borderRadius:'8px', color:'white', cursor: loading ? 'not-allowed' : 'pointer', fontSize:'1rem', fontWeight:'bold' }}
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {error && (
          <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', padding:'1rem', color:'#fca5a5', marginBottom:'1rem' }}>
            Error: {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign:'center', padding:'4rem', color:'#8b9ac0' }}>
            <p>Creating your image... please wait 10-15 seconds</p>
          </div>
        )}

        {imageUrl && !loading && (
          <div style={{ background:'#111e3a', border:'1px solid #1e3058', borderRadius:'14px', padding:'1rem', textAlign:'center' }}>
            <img src={imageUrl} alt={prompt} style={{ width:'100%', borderRadius:'10px', marginBottom:'1rem' }} />
            <a href={imageUrl} target="_blank" rel="noreferrer" style={{ display:'inline-block', padding:'0.5rem 1.5rem', background:'#4f8eff', borderRadius:'8px', color:'white', textDecoration:'none', fontWeight:'bold' }}>
              Download Image
            </a>
          </div>
        )}

      </div>
    </div>
  )
}