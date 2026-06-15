import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = 'http://localhost:3001'

const STYLES = [
  { id: 'naruto', label: 'Naruto Anime', prompt: 'naruto anime style' },
  { id: 'disney', label: 'Disney Pixar', prompt: 'disney pixar style' },
  { id: 'marvel', label: 'Marvel Hero', prompt: 'marvel superhero style' },
  { id: 'dragon', label: 'Dragon Ball Z', prompt: 'dragon ball z anime style' },
  { id: 'onepiece', label: 'One Piece', prompt: 'one piece anime style' },
  { id: 'athlete', label: 'Sports Athlete', prompt: 'sports athlete poster style' },
  { id: 'cyberpunk', label: 'Cyberpunk', prompt: 'cyberpunk futuristic style' },
  { id: 'fantasy', label: 'Fantasy Hero', prompt: 'epic fantasy hero style' },
]

export default function Avatar() {
  const navigate = useNavigate()
  const [selectedStyle, setSelectedStyle] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [resultUrl, setResultUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPreviewUrl(ev.target.result)
      setImageUrl(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  const createAvatar = async () => {
    if (!imageUrl || !selectedStyle) return
    setLoading(true)
    setError('')
    setResultUrl('')
    try {
      const response = await fetch(`${API_BASE}/create-avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: imageUrl, style: selectedStyle.prompt })
      })
      const data = await response.json()
      if (data.error) {
        setError(data.error)
      } else {
        setResultUrl(data.imageUrl)
      }
    } catch (err) {
      setError('Failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#060d1f', padding:'2rem', color:'white' }}>
      <div style={{ maxWidth:'900px', margin:'0 auto' }}>

        <button onClick={() => navigate('/')} style={{ background:'none', border:'none', color:'#4f8eff', cursor:'pointer', fontSize:'1rem', marginBottom:'2rem' }}>
          Back to Home
        </button>

        <h1 style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>AI Avatar Creator</h1>
        <p style={{ color:'#8b9ac0', marginBottom:'2rem' }}>Upload your photo and transform into any character!</p>

        <div style={{ background:'#111e3a', border:'2px dashed #1e3058', borderRadius:'14px', padding:'2rem', textAlign:'center', marginBottom:'2rem' }}>
          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display:'none' }} id="photoUpload" />
          <label htmlFor="photoUpload" style={{ cursor:'pointer' }}>
            {previewUrl ? (
              <img src={previewUrl} alt="Your photo" style={{ width:'150px', height:'150px', borderRadius:'50%', objectFit:'cover', border:'3px solid #4f8eff' }} />
            ) : (
              <div>
                <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📸</div>
                <p style={{ color:'#8b9ac0' }}>Click to upload your photo</p>
              </div>
            )}
          </label>
        </div>

        <h3 style={{ color:'#8b9ac0', marginBottom:'1rem' }}>Choose your style:</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'1rem', marginBottom:'2rem' }}>
          {STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style)}
              style={{
                padding:'1rem',
                background: selectedStyle?.id === style.id ? 'linear-gradient(135deg,#4f8eff,#8b5cf6)' : '#111e3a',
                border: selectedStyle?.id === style.id ? '2px solid #4f8eff' : '2px solid #1e3058',
                borderRadius:'12px',
                color:'white',
                cursor:'pointer',
                fontSize:'0.85rem',
                fontWeight:'bold'
              }}
            >
              {style.label}
            </button>
          ))}
        </div>

        <button
          onClick={createAvatar}
          disabled={loading || !imageUrl || !selectedStyle}
          style={{
            width:'100%',
            padding:'1rem',
            background: loading || !imageUrl || !selectedStyle ? '#1e3058' : 'linear-gradient(135deg,#4f8eff,#8b5cf6)',
            border:'none',
            borderRadius:'12px',
            color:'white',
            cursor: loading || !imageUrl || !selectedStyle ? 'not-allowed' : 'pointer',
            fontSize:'1.1rem',
            fontWeight:'bold',
            marginBottom:'2rem'
          }}
        >
          {loading ? 'Creating your avatar...' : 'Create Avatar'}
        </button>

        {error && (
          <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', padding:'1rem', color:'#fca5a5', marginBottom:'1rem' }}>
            Error: {error}
          </div>
        )}

        {resultUrl && !loading && (
          <div style={{ background:'#111e3a', border:'1px solid #1e3058', borderRadius:'14px', padding:'1.5rem', textAlign:'center' }}>
            <h3 style={{ marginBottom:'1rem' }}>Your Avatar is Ready!</h3>
            <img src={resultUrl} alt="avatar" style={{ width:'100%', maxWidth:'512px', borderRadius:'12px', marginBottom:'1rem' }} />
            <a href={resultUrl} target="_blank" rel="noreferrer" style={{ display:'inline-block', padding:'0.75rem 2rem', background:'#4f8eff', borderRadius:'8px', color:'white', textDecoration:'none', fontWeight:'bold' }}>
              Download Avatar
            </a>
          </div>
        )}

      </div>
    </div>
  )
}
