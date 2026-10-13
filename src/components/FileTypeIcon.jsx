import React from "react";

const KINDS = [
  { re: /\.pdf$/i,                         label: "PDF",         short: "PDF", color: "#E5484D" },
  { re: /\.(docx?|rtf|odt)$/i,             label: "Word document", short: "DOC", color: "#2B6CD4" },
  { re: /\.(xlsx?|ods)$/i,                 label: "Spreadsheet", short: "XLS", color: "#1F9D55" },
  { re: /\.csv$/i,                         label: "CSV",         short: "CSV", color: "#1F9D55" },
  { re: /\.(pptx?|odp|key)$/i,             label: "Presentation", short: "PPT", color: "#E8742A" },
  { re: /\.(zip|rar|7z|tar|gz)$/i,         label: "Archive",     short: "ZIP", color: "#C68A1B" },
  { re: /\.(mp3|wav|m4a|ogg|flac|aac)$/i,  label: "Audio",       short: "MP3", color: "#9B5DE5" },
  { re: /\.(mp4|mov|webm|mkv|avi)$/i,      label: "Video",       short: "MP4", color: "#D6409F" },
  { re: /\.(png|jpe?g|gif|webp|svg|bmp)$/i, label: "Image",      short: "IMG", color: "#0EA5A4" },
  { re: /\.(json|xml|ya?ml)$/i,            label: "Data file",   short: "{ }", color: "#6E7BDB" },
  { re: /\.(js|jsx|ts|tsx|py|java|c|cpp|cs|go|rs|html|css|sql|sh|php|rb)$/i, label: "Code", short: "</>", color: "#6E7BDB" },
  { re: /\.(txt|md|log)$/i,                label: "Text",        short: "TXT", color: "#8B8B8B" },
];

export function getFileKind(name = "", mime = "") {
  const hit = KINDS.find((k) => k.re.test(name));
  if (hit) return hit;
  if (mime.startsWith("image/")) return KINDS.find((k) => k.short === "IMG");
  if (mime.startsWith("video/")) return KINDS.find((k) => k.short === "MP4");
  if (mime.startsWith("audio/")) return KINDS.find((k) => k.short === "MP3");
  if (mime === "application/pdf") return KINDS[0];
  return { label: "File", short: "FILE", color: "#8B8B8B" };
}

export default function FileTypeIcon({ name, mime, size = 36 }) {
  const k = getFileKind(name, mime);
  return (
    <span
      title={k.label}
      style={{
        width: size, height: size, borderRadius: Math.round(size * 0.24),
        background: k.color, color: "#fff", display: "inline-flex",
        alignItems: "center", justifyContent: "center", flexShrink: 0,
        fontSize: Math.round(size * (k.short.length > 3 ? 0.26 : 0.3)),
        fontWeight: 700, letterSpacing: 0.3, fontFamily: "system-ui, sans-serif",
        lineHeight: 1, userSelect: "none",
      }}
    >
      {k.short}
    </span>
  );
}