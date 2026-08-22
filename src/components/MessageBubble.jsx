import { useState } from 'react';
import { Copy, RotateCcw, Pencil, Check, FileText, X } from 'lucide-react';
import AnswerCard from './AnswerCard';
import ThinkingPanel from './ThinkingPanel';

function normalizeImages(images = []) {
  return images.map((img) => ({
    src: img.src || img.url || '',
    alt: img.alt || img.description || '',
    sourceUrl: img.sourceUrl || img.source_url || img.pageUrl || '',
    sourceTitle: img.sourceTitle || img.source || img.domain || '',
    favicon: img.favicon || '',
  }));
}

export default function MessageBubble({
  message,
  isUser,
  isStreaming,
  query,
  onSendQuery,
  onRegenerate,
  onFeedback,
  onOpenPanel,
  onOpenSources,
  onOpenImages,
  onOpenSourceDetail,
  onOpenEntity,
}) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content || '');

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content || '')
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => alert('Failed to copy.'));
  };

  const handleEditOpen = () => {
    setEditValue(message.content || '');
    setIsEditing(true);
  };

  const handleEditCancel = () => setIsEditing(false);

  const handleEditSave = () => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    setIsEditing(false);
    onSendQuery?.(trimmed, {
      edit: true,
      messageId: message.id || message._id,
    });
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const userBubbleClass = 'max-w-[85%] px-5 py-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl rounded-tr-sm';

  if (!isUser) {
    const hasContent = !!message.content;
    if (isStreaming && !hasContent) {
      return null;
    }
    if (!hasContent) return null;

    const normalizedImages = normalizeImages(message.images ?? []);

    return (
      <div className="w-full" style={{ overflow: 'visible' }}>
        <div style={{ maxHeight: 'none', overflow: 'visible', width: '100%' }}>
          <AnswerCard
            content={message.content}
            sources={message.sources ?? []}
            jobs={message.jobs ?? []}
            followUps={message.followUps ?? []}
            images={normalizedImages}
            timestamp={message.timestamp}
            onFollowUpClick={(text) => onSendQuery?.(text)}
            onRegenerate={() => onRegenerate?.(message.id)}
            onFeedback={onFeedback}
            onOpenSources={onOpenSources}
            onOpenImages={onOpenImages}
            onOpenSourceDetail={onOpenSourceDetail}
            onOpenEntity={onOpenEntity}
          />
        </div>
      </div>
    );
  }

  const formattedTime = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  return (
    <div className="group flex justify-end w-full">
      <div className="flex flex-col items-end gap-1 max-w-[85%]">
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-end mb-1">
            {message.attachments.map((att, i) =>
              att.type === 'image' && att.previewUrl ? (
                <img
                  key={att.id || i}
                  src={att.previewUrl}
                  alt={att.name || 'attachment'}
                  className="w-20 h-20 object-cover rounded-xl border border-[#2a2a2a]"
                />
              ) : (
                <div
                  key={att.id || i}
                  className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl max-w-[200px]"
                >
                  <FileText size={16} className="text-gray-400 shrink-0" />
                  <span className="text-xs text-gray-300 truncate">{att.name}</span>
                </div>
              )
            )}
          </div>
        )}

        {isEditing ? (
          <div className="w-full min-w-[280px] px-4 py-3 bg-[#1a1a1a] border border-[#7C83DB] rounded-2xl rounded-tr-sm">
            <textarea
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleEditKeyDown}
              rows={Math.min(8, Math.max(2, editValue.split('\n').length))}
              className="w-full bg-transparent text-sm text-white resize-none outline-none placeholder:text-gray-500"
            />
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                onClick={handleEditCancel}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X size={13} />
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={!editValue.trim()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-white text-black font-medium hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Check size={13} />
                Save
              </button>
            </div>
          </div>
        ) : (
          message.content && (
            <div className={userBubbleClass}>
              <div className="text-sm text-white whitespace-pre-wrap break-words">
                {message.content}
              </div>
            </div>
          )
        )}

        <div className="flex items-center gap-3 px-2">
          {formattedTime && !isEditing && (
            <span className="text-[11px] text-gray-500">{formattedTime}</span>
          )}
          {!isEditing && (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onRegenerate?.(message.id)}
                title="Retry"
                className="text-gray-500 hover:text-gray-300 p-1"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={handleEditOpen}
                title="Edit"
                className="text-gray-500 hover:text-gray-300 p-1"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={handleCopy}
                title={copied ? 'Copied!' : 'Copy'}
                className="text-gray-500 hover:text-gray-300 p-1"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
