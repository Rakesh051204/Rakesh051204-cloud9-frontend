import React, { useEffect, useState } from "react";
import FileTypeIcon, { getFileKind } from "./FileTypeIcon";
import { findStashed } from "../utils/fileStash.js";

const NARROW = "clamp(300px, 24vw, 360px)";

export default function AttachmentPreview({ file, onClose }) {
  const [full, setFull] = useState(false);
  const [url, setUrl] = useState("");
  const [looked, setLooked] = useState(false);

  const name = (file && (file.name || file.originalName)) || "file";
  const mime = (file && (file.mimetype || file.mimeType || file.type)) || "";

  // find the file: direct url first, else the copy the browser kept
  useEffect(() => {
    let made = "";
    let dead = false;
    setLooked(false);
    (async () => {
      const direct = file && (file.url || file.previewUrl || file.blobUrl || file.src || file.dataUrl);
      if (direct) { if (!dead) { setUrl(direct); setLooked(true); } return; }
      const raw = file && (file.file || file.blob);
      let blob = typeof Blob !== "undefined" && raw instanceof Blob ? raw : null;
      if (!blob) blob = await findStashed(name, file && file.size);
      if (blob && !dead) { made = URL.createObjectURL(blob); setUrl(made); }
      if (!dead) setLooked(true);
    })();
    return () => { dead = true; if (made) URL.revokeObjectURL(made); };
  }, [file, name]);

  // push the chat left only in drawer mode
  useEffect(() => {
    document.documentElement.style.setProperty("--att-prev-w", full ? "0px" : NARROW);
    document.body.classList.add("att-prev-open");
    return () => {
      document.body.classList.remove("att-prev-open");
      document.documentElement.style.removeProperty("--att-prev-w");
    };
  }, [full]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (full) setFull(false); else onClose && onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [full, onClose]);

  if (!file) return null;
  const kind = getFileKind(name, mime);
  const isPdf = /\.pdf$/i.test(name) || mime === "application/pdf";
  const isImg = mime.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(name);
  const isVid = mime.startsWith("video/") || /\.(mp4|mov|webm|mkv)$/i.test(name);
  const isAud = mime.startsWith("audio/") || /\.(mp3|wav|m4a|ogg|flac)$/i.test(name);

  const msg = (text) => (
    <div style={{ margin: "auto", textAlign: "center", color: "#9a9a96", padding: 24, fontSize: 13, maxWidth: 320 }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
        <FileTypeIcon name={name} mime={mime} size={52} />
      </div>
      {text}
    </div>
  );

  let body;
  if (!looked) body = msg("Preparing preview...");
  else if (!url) body = msg("Preview not available. Attach this file again in a chat and it will show here.");
  else if (isPdf) body = <iframe title={name} src={url + (full ? "#view=FitH" : "#toolbar=0&navpanes=0&view=FitH")} style={{ flex: 1, width: "100%", border: 0, background: full ? "#0d0d0c" : "#fff" }} />;
  else if (isImg) body = <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}><img src={url} alt={name} style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 8 }} /></div>;
  else if (isVid) body = <video src={url} controls style={{ width: "100%", margin: "auto" }} />;
  else if (isAud) body = <audio src={url} controls style={{ width: "90%", margin: "auto" }} />;
  else body = msg("No preview for this file type. Use Download.");

  const btn = { background: "transparent", border: 0, color: "#cfcfca", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "4px 8px" };
  const box = full
    ? { top: 0, left: 0, right: 0, bottom: 0, width: "100vw", borderLeft: 0 }
    : { top: 0, right: 0, bottom: 0, width: NARROW, borderLeft: "1px solid rgba(255,255,255,0.08)" };

  return (
    <>
      <style>{`body.att-prev-open #root { padding-right: var(--att-prev-w, 340px); box-sizing: border-box; transition: padding-right .18s ease; }`}</style>
      <div style={{ position: "fixed", zIndex: 2000, background: "#0d0d0c", display: "flex", flexDirection: "column", ...box }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <FileTypeIcon name={name} mime={mime} size={26} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ color: "#eee", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
            <div style={{ color: "#8b8b86", fontSize: 11 }}>{kind.label}</div>
          </div>
          {url && <a href={url} download={name} style={{ ...btn, textDecoration: "none", fontSize: 13 }}>Download</a>}
          <button onClick={() => setFull((f) => !f)} title={full ? "Exit full screen" : "Full screen"} style={btn}>{full ? "⤡" : "⤢"}</button>
          <button onClick={onClose} aria-label="Close" style={{ ...btn, fontSize: 20 }}>×</button>
        </div>
        {body}
      </div>
    </>
  );
}