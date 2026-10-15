import React, { useState } from "react";
import AttachmentPreview from "./AttachmentPreview";
import FileTypeIcon, { getFileKind } from "./FileTypeIcon";

export default function AttachmentList({ attachments }) {
  const [preview, setPreview] = useState(null);
  if (!attachments || attachments.length === 0) return null;

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end", marginBottom: 6 }}>
        {attachments.map((att, i) => {
          const name = att.name || att.originalName || "file";
          const mime = att.mimetype || att.mimeType || att.type || "";
          const src = att.url || att.previewUrl || att.thumb || att.src || att.dataUrl || "";
          const isImg = (mime.startsWith("image/") || att.type === "image" || /\.(png|jpe?g|gif|webp|bmp)$/i.test(name)) && src;
          if (isImg) {
            return (
              <img
                key={i} src={src} alt={name} onClick={() => setPreview(att)}
                style={{ height: 120, maxWidth: 220, objectFit: "cover", borderRadius: 12, cursor: "pointer", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            );
          }
          const kind = getFileKind(name, mime);
          return (
            <button
              key={i} onClick={() => setPreview(att)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 12px 8px 8px",
                background: "#1c1c1b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
                cursor: "pointer", textAlign: "left", maxWidth: 260,
              }}
            >
              <FileTypeIcon name={name} mime={mime} size={36} />
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", color: "#eee", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 190 }}>{name}</span>
                <span style={{ display: "block", color: "#8b8b86", fontSize: 11 }}>{kind.label}</span>
              </span>
            </button>
          );
        })}
      </div>
      {preview && <AttachmentPreview file={preview} onClose={() => setPreview(null)} />}
    </>
  );
}