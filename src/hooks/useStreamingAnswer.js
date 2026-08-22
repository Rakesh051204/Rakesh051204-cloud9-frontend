import { useState, useRef, useCallback } from 'react';

/**
 * Decouples network speed from display speed.
 * - Tokens arrive fast over SSE and get pushed into a buffer.
 * - A timer reveals the buffer one WORD at a time -> the "typing" effect.
 * - Whenever a paragraph (\n\n) is fully revealed, it's marked "settled" ->
 *   the component can fade/settle that block in as finished while the
 *   next paragraph keeps typing. This gets you all three streaming
 *   behaviors (typing + paragraph reveal + fast underlying chunks) from
 *   one mechanism instead of three competing ones.
 */
export function useStreamingAnswer({ revealMs = 16 } = {}) {
  const [displayedText, setDisplayedText] = useState('');
  const [settledParagraphs, setSettledParagraphs] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const bufferRef = useRef('');
  const displayedRef = useRef('');
  const timerRef = useRef(null);

  const tick = useCallback(() => {
    const buffer = bufferRef.current;
    const shown = displayedRef.current;

    if (shown.length >= buffer.length) {
      timerRef.current = null;
      return;
    }

    // reveal the next whitespace-run + word, not a single character
    const rest = buffer.slice(shown.length);
    const match = rest.match(/^\s*\S+/);
    const nextChunk = match ? match[0] : rest;
    const next = shown + nextChunk;

    displayedRef.current = next;
    setDisplayedText(next);
    setSettledParagraphs(next.split(/\n\n+/).slice(0, -1));

    timerRef.current = setTimeout(tick, revealMs);
  }, [revealMs]);

  const pushChunk = useCallback(
    (chunk) => {
      bufferRef.current += chunk;
      setIsStreaming(true);
      if (!timerRef.current) tick();
    },
    [tick]
  );

  // call when the SSE stream sends its "done" event — flushes any
  // remaining buffered text instantly instead of waiting for the timer
  const finish = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = null;
    displayedRef.current = bufferRef.current;
    setDisplayedText(bufferRef.current);
    setSettledParagraphs(bufferRef.current.split(/\n\n+/));
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = null;
    bufferRef.current = '';
    displayedRef.current = '';
    setDisplayedText('');
    setSettledParagraphs([]);
    setIsStreaming(false);
  }, []);

  return { displayedText, settledParagraphs, isStreaming, pushChunk, finish, reset };
}