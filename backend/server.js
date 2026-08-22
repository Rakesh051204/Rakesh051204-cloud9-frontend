const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const OLLAMA_URL = 'http://localhost:11434/api/chat';

// Test endpoint to verify the server is alive and using this file
app.get('/ping', (req, res) => {
  res.json({ status: 'ok', using: 'axios' });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    const response = await axios.post(OLLAMA_URL, {
      model: 'deepseek-r1:7b',
      messages: messages,
      stream: false
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    res.json({ content: response.data.message.content });
  } catch (error) {
    console.error('Backend error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log('Backend running on http://localhost:' + PORT));
