import { useState, useRef, useEffect } from 'react'
// import "./Chat.css";
import { StepChecklist, ThinkingPanel, SourceCard, STEPS } from './components/ThinkingUI'
import {
  Paperclip, Camera, Folder, Brain, Plug, Puzzle, Search, Palette,
  UserCircle2, Code2, BookOpen, Sparkles, Cloud, User, Download,
  Mic, ArrowUp, AlertTriangle, Plus,
} from 'lucide-react'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showPlusMenu, setShowPlusMenu] = useState(false)
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const plusMenuRef = useRef(null)

  // Autoscroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Close plus menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target)) {
        setShowPlusMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
      }
      recognitionRef.current.onend = () => setIsListening(false)
    }
  }, [])

  const toggleMic = () => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handlePlusAction = (action) => {
    setShowPlusMenu(false)
    // ... (keep your existing handlePlusAction logic)
  }

  const handleSend = async (text) => {
    const query = text || input.trim()
    if (!query) return

    setMessages(prev => [...prev, { role: 'user', content: query, type: 'text' }])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch("http://localhost:3001/api/chat/stream", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query })
      })

      if (!response.ok) throw new Error('Server error')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      setMessages(prev => [...prev, { role: 'assistant', type: 'text', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue

            assistantMessage += data + ' '

            setMessages(prev => {
              const newMessages = [...prev]
              newMessages[newMessages.length - 1].content = assistantMessage.trim()
              return newMessages
            })
          }
        }
      }
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        type: 'error',
        content: 'Failed to connect to local server. Make sure backend is running on port 3001.'
      }])
    } finally {
      setLoading(false)
    }
  }

  // Keep your other functions (handleFileUpload, handleDownload, renderContent, etc.)

  return (
    <div className="chat-app">
      {/* ... rest of your JSX remains the same ... */}
      {/* Make sure the input calls handleSend on Enter and button click */}
    </div>
  )
}