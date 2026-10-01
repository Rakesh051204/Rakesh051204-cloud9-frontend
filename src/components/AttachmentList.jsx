import { useState } from 'react';
import { FileText, Play } from 'lucide-react';
import AttachmentPreview from './AttachmentPreview';

export default function AttachmentList({ attachments }) {
  const [preview, setPreview] = useState(null);
  if (!attachments || attachments.length === 0) return null;

  const open = (att) =>
    setPreview({
      name: att.name,
      url: att.blobUrl || att.previewUrl || null,
      type: att.mime || (att.type === 'image' ? 'image/*' : att.type === 'video' ? 'video/*' : ''),
    });

  return (
    <>
      <div className="flex flex-wrap gap-2 justify-end mb-1">
        {attachments.map((att, i) =>
          att.type === 'image' && att.previewUrl ? (
            <img
              key={att.id || i}
              src={att.previewUrl}
              alt={att.name || 'attachment'}
              onClick={() => open(att)}
              className="w-20 h-20 object-cover rounded-xl border border-[#2a2a2a] cursor-zoom-in hover:opacity-90 transition-opacity"
            />
          ) : (
            <button
              key={att.id || i}
              type="button"
              onClick={() => open(att)}
              className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl max-w-[200px] cursor-pointer hover:border-[#3a3a3a] transition-colors"
            >
              {att.type === 'video'
                ? <Play size={16} className="text-gray-400 shrink-0" />
                : <FileText size={16} className="text-gray-400 shrink-0" />}
              <span className="text-xs text-gray-300 truncate">{att.name}</span>
            </button>
          )
        )}
      </div>
      <AttachmentPreview file={preview} onClose={() => setPreview(null)} />
    </>
  );
}