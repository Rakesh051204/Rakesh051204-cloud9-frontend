import { useState } from 'react'
import './SearchBar.css'

export default function SearchBar({ onSearch, size = 'large' }) {
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    if (value.trim()) {
      onSearch(value.trim())
    }
  }

  return (
    <div className={`searchbar searchbar--${size}`}>
      <span className="searchbar-icon">🔍</span>
      <input
        className="searchbar-input"
        placeholder="Ask anything..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        autoFocus={size === 'large'}
      />
      {value && (
        <button className="searchbar-clear" onClick={() => setValue('')}>×</button>
      )}
      <button
        className="searchbar-btn"
        onClick={handleSubmit}
        disabled={!value.trim()}
      >
        Search
      </button>
    </div>
  )
}