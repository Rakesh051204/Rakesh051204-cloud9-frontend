\# Stoic — AI Search \& Chat Frontend



React/Vite frontend for \*\*Stoic\*\*, an AI answer engine with real-time streaming, image search, and voice mode — built from the ground up with a custom dark UI.



> Backend: \[stoic-ultra-backend](https://github.com/Rakesh051204/stoic-ultra-backend)



\## What it does



Stoic's UI delivers streamed AI answers with inline citations, image search results, file uploads with vision analysis, and a voice mode overlay — every component built custom in React.



\- \*\*Streaming responses\*\* rendered live via SSE as the backend generates them

\- \*\*Inline citation rendering\*\* with source cards

\- \*\*Image search \& lightbox\*\* for visual results

\- \*\*File attachment pipeline\*\* — drag/drop images, PDFs, DOCX, audio, video

\- \*\*Voice mode\*\* with particle animations

\- \*\*Discover/news tab\*\* powered by GNews



\## Tech Stack



| Layer | Tech |

|---|---|

| Framework | React + Vite |

| Styling | Custom CSS, dark-themed UI |

| Data | Supabase client (auth, memory) |

| Realtime | Server-Sent Events (SSE) |

| Markdown | react-markdown |



\## Key Components



\- `SearchBox.jsx` — main query input with file attach \& voice trigger

\- `ThinkingPanel.jsx` — shows the model's reasoning/search steps live

\- `AnswerCard.jsx` — renders streamed answers with citations

\- `MessageBubble.jsx` — chat message rendering

\- `SourcesPanel.jsx` — inline source/citation display

\- `Sidebar.jsx` — conversation history \& navigation



\## Running Locally



```bash

npm install

npm run dev

```



Requires \[stoic-ultra-backend](https://github.com/Rakesh051204/stoic-ultra-backend) running locally or deployed, with the API URL configured in `.env`.



\---



Built by \[Rakesh Palani](https://github.com/Rakesh051204) — part of a broader portfolio of AI-powered products.

