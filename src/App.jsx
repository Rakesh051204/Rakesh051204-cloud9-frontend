const handleSearch = async () => {
  if (!query.trim()) return
  
  setLoading(true)
  setError('')
  setAnswer('')
  
  try {
    const response = await fetch('http://localhost:3001/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: query.trim() })
    })
    
    const data = await response.json()
    
    if (data.error) {
      setError(data.error)
    } else {
      setAnswer(data.answer)
    }
  } catch (err) {
    setError('Failed to connect to backend. Error: ' + err.message)
  } finally {
    setLoading(false)
  }
}