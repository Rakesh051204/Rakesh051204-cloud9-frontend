import { useState, useEffect, useRef } from "react";

export default function StreamingAnswer({ query, onComplete }) {
  const [text, setText] = useState("");
  const controllerRef = useRef(null);

  useEffect(() => {
    if (!query) return;

    const fetchStream = async () => {
      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const response = await fetch("http://localhost:3001/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
          signal: controller.signal,
        });

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          buffer += chunk;
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") {
                if (onComplete) onComplete();
                return;
              }
              setText((prev) => prev + data + " ");
            }
          }
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Stream error:", err);
          setText("Error loading response.");
        }
      }
    };

    fetchStream();

    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [query, onComplete]);

  return <div className="whitespace-pre-wrap leading-relaxed">{text}</div>;
}