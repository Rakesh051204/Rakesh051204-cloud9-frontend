import CodeBlock from "./CodeBlock";

// Example 1: static code block (e.g. inside AnswerCard's markdown renderer)
function Example1() {
  return (
    <CodeBlock
      language="python"
      code={`message = "Hello, World!"\nprint(message)`}
    />
  );
}

// Example 2: runnable block that calls your backend to execute code
// (e.g. a /execute endpoint proxying to Judge0, Piston, or your own sandbox)
function Example2() {
  const runOnBackend = async (code) => {
    const res = await fetch("/api/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: "python", code }),
    });
    const data = await res.json();
    return data.output;
  };

  return (
    <CodeBlock
      language="python"
      code={`for i in range(3):\n    print(i)`}
      runnable
      onRun={runOnBackend}
    />
  );
}

// Example 3: wiring into a markdown renderer (e.g. react-markdown)
// so every fenced code block in an AI response gets this treatment
import ReactMarkdown from "react-markdown";

function MarkdownAnswer({ content }) {
  return (
    <ReactMarkdown
      components={{
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          if (inline) {
            return <code {...props}>{children}</code>;
          }
          return (
            <CodeBlock
              language={match ? match[1] : "text"}
              code={String(children).replace(/\n$/, "")}
            />
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export { Example1, Example2, MarkdownAnswer };