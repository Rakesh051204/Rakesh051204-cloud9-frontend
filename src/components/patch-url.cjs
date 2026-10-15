const fs = require('fs');
let s = fs.readFileSync('SearchBox.jsx', 'utf8');
if (s.includes('/*ATT-URL*/')) { console.log('already patched'); process.exit(0); }
const re = /const attachmentsMeta = doneAttachments\.map\(\((\w+)\) => \(\{/;
const m = s.match(re);
if (!m) { console.log('PATCH FAILED: attachmentsMeta map not found'); process.exit(1); }
const v = m[1];
const add = m[0] + `\n      url: ${v}.url || ${v}.previewUrl || (() => { const b = Object.values(${v}).find((x) => typeof Blob !== "undefined" && x instanceof Blob); return b ? URL.createObjectURL(b) : undefined; })(), /*ATT-URL*/`;
s = s.replace(re, add);
fs.writeFileSync('SearchBox.jsx', s, 'utf8');
console.log('PATCHED SearchBox.jsx');
