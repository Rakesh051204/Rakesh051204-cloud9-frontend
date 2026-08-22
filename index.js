import express from 'express';
import conversationsRouter from './routes/conversations.js'
import projectsRouter from './routes/projects.js'
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import axios from 'axios'; // ← ADDED for Pexels

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api/conversations', conversationsRouter)
app.use('/api/projects', projectsRouter)

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const TAVILY_API_KEY = process.env.TAVILY_API_KEY || '';
const TAVILY_URL = 'https://api.tavily.com/search';

app.post('/feedback', (req, res) => res.json({ success: true }));

// ---------- SINGLE‑CALL FAST CHAT ENDPOINT ----------
app.post('/api/chat', async (req, res) => {
  const { message, webSearchOn = true, model = 'llama-3.1-8b-instant' } = req.body;

  try {
    let sources = [];
    let searchContext = '';
    let images = []; // ← ADDED for Pexels

    // 1. Web Search (Tavily)
    if (webSearchOn && TAVILY_API_KEY) {
      const response = await fetch(TAVILY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: TAVILY_API_KEY,
          query: message,
          search_depth: 'basic',
          max_results: 5,
        }),
      });
      const data = await response.json();
      if (data.results) {
        sources = data.results.map(r => ({ title: r.title, url: r.url }));
        searchContext = data.results.map(r => r.content).join('\n\n');
      }
    }

    // 2. Image search (Pexels) – free 200 requests/hour
    if (process.env.PEXELS_API_KEY) {
      try {
        const pexelsResponse = await axios.get('https://api.pexels.com/v1/search', {
          headers: { Authorization: process.env.PEXELS_API_KEY },
          params: { query: message, per_page: 8 },
        });
        images = pexelsResponse.data.photos.map(p => ({
          url: p.src.medium,        // medium size – good for thumbnails
          description: p.alt || p.photographer,
        }));
      } catch (e) {
        console.warn('Pexels error:', e.message);
      }
    }

    // 3. One powerful prompt – answer + follow‑ups
    const systemPrompt = `You are a precise, helpful AI assistant.
Answer the user's question using the provided search context if available.
Be clear, factual, and use bullet points or tables when appropriate.
If the context doesn't contain the answer, say "I don't have confirmed information" – never guess.

After your answer, suggest 2‑3 natural follow‑up questions as a JSON array.
Format your entire response as a JSON object with two keys:
- "answer": (your main text)
- "followUps": (array of strings)

Example:
{
  "answer": "Your answer here...",
  "followUps": ["Question 1?", "Question 2?"]
}`;

    const userContent = searchContext
      ? `Search Context:\n${searchContext}\n\nQuestion: ${message}`
      : `Question: ${message}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      model: model,
      temperature: 0.0,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    });

    const raw = completion.choices[0].message.content;
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { answer: raw, followUps: [] };
    }

    const answer = parsed.answer || parsed.content || raw;
    const followUps = parsed.followUps || [];

    // 4. Send response – with images!
    res.json({
      content: answer,
      sources: sources.slice(0, 5),
      followUps: followUps.slice(0, 3),
      images: images.slice(0, 8),      // ← ADDED – images will appear in the strip
      thinkingSummary: 'Answer + images generated.',
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Server error – please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});