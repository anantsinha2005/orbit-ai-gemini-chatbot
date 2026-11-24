# Project 10 — Orbit Gemini Chatbot

A responsive chatbot web app powered by Google Gemini API, created for Web Development Lab Experiment 10.

## Features
- Chat-style UI with conversation history
- Gemini API integration through a server-side endpoint
- Suggested starter prompts
- New chat / clear conversation
- Responsive desktop and mobile layout
- API key stored server-side in `.env`

## Requirements
- Node.js 18+
- Gemini API key

## Setup
1. Open the project folder in VS Code.
2. Install packages: `npm install`
3. Copy `.env.example` to `.env`: `Copy-Item .env.example .env`
4. Put your Gemini key in `.env` as `GEMINI_API_KEY=...`
5. Start: `npm start`
6. Open `http://localhost:4000`

## API
- `GET /api/health` — health check
- `POST /api/chat` — send an array of messages `{role: "user"|"assistant", content: "..."}`; returns `{reply}`

Do not commit `.env` or share your API key.
