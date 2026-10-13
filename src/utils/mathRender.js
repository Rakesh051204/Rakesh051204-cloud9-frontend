import renderMathInElement from "katex/contrib/auto-render";
import "katex/dist/katex.min.css";

const style = document.createElement("style");
style.textContent = `
  .katex { font-size: 1.12em; }
  .katex-display { margin: 1.1em 0; overflow-x: auto; overflow-y: hidden; padding: 2px 0; }
  .katex-display > .katex { text-align: center; }
  .katex .boxed, .katex .fbox { border-color: currentColor; }
`;
document.head.appendChild(style);

const OPTS = {
  delimiters: [
    { left: "$$", right: "$$", display: true },
    { left: "\\[", right: "\\]", display: true },
    { left: "\\(", right: "\\)", display: false },
  ],
  throwOnError: false,
  ignoredClasses: ["katex", "katex-display"],
  ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code", "input"],
};

let timer = null;
const obs = new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(run, 450); });
const watch = () => obs.observe(document.body, { childList: true, subtree: true, characterData: true });

function run() {
  const t = document.body.textContent || "";
  if (!(t.includes("\\(") || t.includes("\\[") || t.includes("$$"))) return;
  obs.disconnect();
  try { renderMathInElement(document.body, OPTS); } catch (e) { console.warn("math render", e); }
  watch();
}

if (!window.__stoicMathHooked) {
  window.__stoicMathHooked = true;
  watch();
  setTimeout(run, 800);
}