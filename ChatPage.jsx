import { useState, useCallback } from 'react';
import SourcesPanel from './SourcesPanel';
import ChatMessages from './ChatMessages'; // your existing message list
import SearchBox from './SearchBox';       // your existing input

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [sources, setSources] = useState([]);
  const [images, setImages] = useState([]);

  // Panel state — starts closed, and NOTHING in the query flow below
  // is allowed to flip this true. Only explicit user clicks do.
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tab, setTab] = useState('sources');
  const [focusedItem, setFocusedItem] = useState(null);

  const handleSubmit = useCallback(async (query) => {
    setSources([]);
    setImages([]);
    setFocusedItem(null);
    // intentionally NOT calling setDetailsOpen(true) here

    const res = await fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = JSON.parse(line.slice(6));

        if (payload.type === 'sources') {
          setSources(payload.sources);
          // still no setDetailsOpen(true) here — sources arriving
          // should never force the panel open
        }
        if (payload.type === 'images') {
          setImages(payload.images);
        }
        if (payload.type === 'token') {
          setMessages((prev) => appendToken(prev, payload.text));
        }
      }
    }
  }, []);

  // --- explicit user-triggered handlers only ---

  const openSourcesTab = () => {
    setTab('sources');
    setFocusedItem(null);
    setDetailsOpen(true);
  };

  const openImagesTab = () => {
    setTab('images');
    setFocusedItem(null);
    setDetailsOpen(true);
  };

  const handleTabChange = (nextTab) => {
    setTab(nextTab);
    setFocusedItem(null);
  };

  const handleSelectSource = (source) => {
    setFocusedItem({ type: 'source', data: source });
  };

  const handleBack = () => setFocusedItem(null);

  const handleAskMore = (name) => {
    setDetailsOpen(false);
    handleSubmit(`Tell me more about ${name}`);
  };

  const handleImageClick = (img) => {
    // open a lightbox, or whatever you already have
  };

  return (
    <div className="flex h-screen bg-[#0d0d0c]">
      <div className="flex-1 flex flex-col min-w-0">
        <ChatMessages
          messages={messages}
          sources={sources}
          onSourcesClick={openSourcesTab}   // e.g. the "12 sources" chip under an answer
          onImagesClick={openImagesTab}
        />
        <SearchBox onSubmit={handleSubmit} />
      </div>

      <SourcesPanel
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        sources={sources}
        images={images}
        focusedItem={focusedItem}
        onBack={handleBack}
        onSelectSource={handleSelectSource}
        tab={tab}
        onTabChange={handleTabChange}
        onImageClick={handleImageClick}
        onAskMore={handleAskMore}
      />
    </div>
  );
}

function appendToken(prev, text) {
  const last = prev[prev.length - 1];
  if (last?.role === 'assistant') {
    const updated = [...prev];
    updated[updated.length - 1] = { ...last, content: last.content + text };
    return updated;
  }
  return [...prev, { role: 'assistant', content: text }];
}