import { Copy, RotateCw, Share2 } from 'lucide-react';
import { useState } from 'react';
import AnswerCard from './AnswerCard';

export default function MessageBubble({ message, isUser, onSendQuery }) {
  const [copied, setCopied] = useState(false);

  const copyMessage = () => {
    navigator.clipboard.writeText(message.content)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => alert('Failed to copy.'));
  };

  const shareMessage = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Stoic AI',
        text: message.content,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(message.content)
        .then(() => alert('Message copied to clipboard – share it anywhere!'))
        .catch(() => alert('Failed to copy.'));
    }
  };

  const regenerateMessage = () => {
    // Re-sends the user's own previous prompt. AnswerCard's follow-up
    // clicks and this button both go through the same sendMessage fn.
    if (onSendQuery && message.content) {
      onSendQuery(message.content);
    }
  };

  // ---- User bubble: unchanged, simple right-aligned box ----
  if (isUser) {
    return (
      <div className="flex justify-end w-full">
        <div className="max-w-[80%] bg-[#2a2a2a] border border-[#3a3a3a] rounded-2xl rounded-tr-sm px-4 py-3">
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-white">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  // ---- Assistant bubble: delegate to AnswerCard, which owns the
  // image-first layout, inline citation popovers, and sources chip. ----
  return (
    <div className="flex justify-start w-full">
      <div className="w-full">
        <div className="text-[10px] text-[#555] mb-1 font-medium px-1">Stoic</div>

        <AnswerCard
          content={message.content}
          sources={message.sources || []}
          images={message.images || []}
          followUps={message.followUps || []}
          streaming={message.streaming}
          onFollowUpClick={onSendQuery}
          onRegenerate={regenerateMessage}
          onShare={shareMessage}
          onOpenSources={(sources) => {
            // No side panel wired up yet — fall back to opening the
            // top source directly. Tell Claude when you want a full
            // slide-out source panel like Perplexity's and this can
            // be replaced with that instead.
            if (sources?.[0]?.url) window.open(sources[0].url, '_blank', 'noopener');
          }}
          onOpenImages={() => {}}
          onOpenSourceDetail={(source) => {
            if (source?.url) window.open(source.url, '_blank', 'noopener');
          }}
        />

        {!message.streaming && (
          <div className="flex items-center gap-1 mt-1 opacity-60 hover:opacity-100 transition-opacity">
            <button onClick={copyMessage} className="p-1.5 rounded hover:bg-[#2a2a2a] transition-colors" title="Copy">
              <Copy size={15} className="text-[#666] hover:text-white" />
              {copied && <span className="text-[10px] text-green-400 ml-1">✓</span>}
            </button>
            <button onClick={shareMessage} className="p-1.5 rounded hover:bg-[#2a2a2a] transition-colors" title="Share">
              <Share2 size={15} className="text-[#666] hover:text-white" />
            </button>
            <button onClick={regenerateMessage} className="p-1.5 rounded hover:bg-[#2a2a2a] transition-colors" title="Regenerate">
              <RotateCw size={15} className="text-[#666] hover:text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}