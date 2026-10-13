// Converts \( \) and \[ \] to $ and $$ so remark-math can render them
export const fixMath = (t = "") =>
  t
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, m) => `\n$$\n${m}\n$$\n`)
    .replace(/\\\((.*?)\\\)/g, (_, m) => `$${m}$`);
