import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import Results from './pages/Results'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Results />} />
        <Route path="/app" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
