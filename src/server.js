require('dotenv').config();
const express = require('express');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json({ limit: '40kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const ai = process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('put_')
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'Gemini Chatbot', status: 'running' }));

app.post('/api/chat', async (req, res) => {
  const messages = req.body && req.body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Send at least one message to start the chat.' });
  }
  if (!ai) return res.status(503).json({ error: 'Gemini is not configured. Add your API key to .env and restart.' });

  const history = messages.slice(-20).map((m) => {
    const role = m && m.role === 'assistant' ? 'model' : 'user';
    const content = typeof (m && m.content) === 'string' ? m.content.trim().slice(0, 4000) : '';
    return { role, parts: [{ text: content }] };
  }).filter((m) => m.parts[0].text);
  if (!history.length || history[history.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'The latest message must be from the user.' });
  }
  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: history,
      config: { systemInstruction: 'You are a helpful, friendly AI chatbot. Give clear, accurate, conversational answers. If you are uncertain, say so.' }
    });
    const reply = response.text && response.text.trim();
    if (!reply) return res.status(502).json({ error: 'Gemini returned an empty response. Please try again.' });
    res.json({ reply });
  } catch (err) {
    console.error('Gemini chat error:', err.message);
    res.status(500).json({ error: 'Chat request failed. Check your API key, model availability, and Gemini quota.' });
  }
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => console.log(`Gemini Chatbot running at http://localhost:${port}`));
