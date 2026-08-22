import { useState } from 'react';
import { Share2, Download, Copy, Check, RefreshCw, ThumbsUp, ThumbsDown, MoreHorizontal } from 'lucide-react';

function ActionButton({ icon: Icon, onClick, label, active }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={
        'w-7 h-7 flex items-center justify-center rounded-md transition-colors ' +
        (active
          ? 'text-[#7C83DB] bg-white/[0.06]'
          : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.06]')
      }
    >
      <Icon size={15} strokeWidth={2} />
    </button>
  );
}

export default function AnswerActions({ answerText, sourceCount, onRegenerate, onShare, onFeedback }) {
  answerText = answerText || '';
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      // clipboard permission denied or unavailable, fail silently
    }
  };

  const handleDownload = () => {
    const blob = new Blob([answerText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'answer.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFeedback = (type) => {
    setFeedback(type === feedback ? null : type);
    if (onFeedback) onFeedback(type);
  };

  return (
    <div className="flex items-center justify-between mt-4 pt-1">
      <div className="flex items-center gap-0.5">
        <ActionButton icon={Share2} onClick={onShare} label="Share" />
        <ActionButton icon={Download} onClick={handleDownload} label="Download" />
        <ActionButton icon={copied ? Check : Copy} onClick={handleCopy} label={copied ? 'Copied' : 'Copy'} active={copied} />
        <ActionButton icon={RefreshCw} onClick={onRegenerate} label="Regenerate" />
        <ActionButton icon={MoreHorizontal} label="More" />
      </div>

      <div className="flex items-center gap-0.5">
        <ActionButton
          icon={ThumbsUp}
          onClick={() => handleFeedback('up')}
          active={feedback === 'up'}
          label="Good response"
        />
        <ActionButton
          icon={ThumbsDown}
          onClick={() => handleFeedback('down')}
          active={feedback === 'down'}
          label="Bad response"
        />
      </div>
    </div>
  );
}