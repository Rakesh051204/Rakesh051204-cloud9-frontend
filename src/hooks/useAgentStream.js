// src/hooks/useAgentStream.js
import { useState, useCallback } from "react";

// Minimum time the "thinking" state stays visible, even if the backend
// responds instantly. Without this, isStreaming flips true -> false in
// under 500ms on fast responses and the spinner never gets a chance to
// paint before React swaps it out for the answer.
const MIN_THINKING_MS = 900;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useAgentStream() {
  const [thinking, setThinking] = useState("");
  const [answer, setAnswer] = useState("");
  const [toolActivity, setToolActivity] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sources, setSources] = useState([]);
  const [followUps, setFollowUps] = useState([]);

  const sendMessage = useCallback(async (message, history) => {
    setThinking("");
    setAnswer("");
    setToolActivity([]);
    setSources([]);
    setFollowUps([]);
    setIsStreaming(true);

    const startedAt = Date.now();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });
      if (!response.ok) {
        throw new Error(`Server responded ${response.status}`);
      }
      const data = await response.json();

      // Turn backend's flat "steps" array (strings) into toolActivity-shaped items
      // so ThinkingPanel keeps working without changes.
      if (Array.isArray(data.steps)) {
        setToolActivity(
          data.steps.map((label, i) => ({ type: "call", id: `step-${i}`, tool: label }))
        );
      }

      // Hold the thinking state for at least MIN_THINKING_MS total,
      // so the OrbitLoader is actually visible before we reveal the answer.
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_THINKING_MS) {
        await wait(MIN_THINKING_MS - elapsed);
      }

      setAnswer(data.content || "");
      setSources(data.sources || []);
      setFollowUps(data.followUps || []);
    } catch (err) {
      console.error("Chat request failed:", err);
      setAnswer("Something went wrong reaching the server. Please try again.");
    } finally {
      setIsStreaming(false);
    }
  }, []);

  return { thinking, answer, toolActivity, sources, followUps, isStreaming, sendMessage };
}