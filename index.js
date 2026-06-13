const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: "Cloud9 backend running 🚀" });
});

app.post('/ask', (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }
  
  // Simple response for now
  res.json({ 
    answer: `You asked: "${query}". This is a test response from Cloud9 backend. Backend is working!` 
  });
});

app.listen(PORT, () => {
  console.log(`☁️ Cloud9 backend running at http://localhost:${PORT}`);
});