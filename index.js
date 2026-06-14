const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3001;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: "Cloud9 backend running 🚀" });
});

app.post('/ask', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: query }]
    });

    res.json({ answer: message.content[0].text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Claude API error: " + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`☁️ Cloud9 backend running at http://localhost:${PORT}`);
});