import { useState, useRef, useCallback, useEffect } from 'react';
import { Copy, ThumbsUp, ThumbsDown, Share2, RotateCcw, Volume2, Square, BookOpen, Check, X } from 'lucide-react';

function pickFemaleVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const preferredNames = [
    'Google UK English Female',
    'Microsoft Zira',
    'Samantha',
    'Microsoft Aria',
    'Google US English Female',
  ];

  for (const name of preferredNames) {
    const match = voices.find((v) => v.name.includes(name));
    if (match) return match;
  }

  const femaleGuess = voices.find(
    (v) => /female/i.test(v.name) && v.lang.startsWith('en')
  );
  if (femaleGuess) return femaleGuess;

  return voices.find((v) => v.lang.startsWith('en')) || voices[0];
}

function useReadAloud(text) {
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef(null);

  const toggle = useCallback(() => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const speak = () => {
      const utter = new SpeechSynthesisUtterance(
        text.replace(/⟦cite:[^⟧]+⟧/g, '').replace(/\*\*/g, '')
      );
      const voice = pickFemaleVoice();
      if (voice) utter.voice = voice;
      utter.pitch = 1.05;
      utter.rate = 0.98;
      utter.volume = 1;
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);
      utterRef.current = utter;
      window.speechSynthesis.speak(utter);
      setSpeaking(true);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = speak;
    } else {
      speak();
    }
  }, [speaking, text]);

  return { speaking, toggle };
}

const NEGATIVE_ISSUE_TYPES = [
  { value: '', label: 'Select...' },
  { value: 'incorrect', label: 'Incorrect information' },
  { value: 'memory', label: 'Issue with memory' },
  { value: 'not_helpful', label: 'Not helpful' },
  { value: 'harmful', label: 'Harmful or unsafe' },
  { value: 'formatting', label: 'Formatting issue' },
  { value: 'other', label: 'Other' },
];

function FeedbackModal({ type, onCancel, onSubmit }) {
  const [issueType, setIssueType] = useState('');
  const [details, setDetails] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  const isPositive = type === 'up';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-[17px] font-semibold text-white">
            {isPositive ? 'Give positive feedback' : 'Give negative feedback'}
          </h3>
          <button
            onClick={onCancel}
            className="p-1 rounded-md text-gray-500 hover:text-gray-200 hover:bg-white/[0.06] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {!isPositive && (
          <div className="mb-4">
            <label className="block text-[13px] text-gray-400 mb-1.5">
              What type of issue do you wish to report? (optional)
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full rounded-lg bg-white/[0.05] border border-white/10 text-gray-200 text-[14px] px-3 py-2.5
                         focus:outline-none focus:ring-1 focus:ring-[#7C83DB]/60 focus:border-[#7C83DB]/60 transition-colors"
            >
              {NEGATIVE_ISSUE_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#1a1a1a]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-[13px] text-gray-400 mb-1.5">
            Please provide details: (optional)
          </label>
          <textarea
            ref={textareaRef}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={
              isPositive
                ? 'What was satisfying about this response?'
                : 'What was unsatisfying about this response?'
            }
            rows={4}
            className="w-full resize-none rounded-lg bg-white/[0.05] border border-white/10 text-gray-200 text-[14px] px-3 py-2.5
                       placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#7C83DB]/60 focus:border-[#7C83DB]/60 transition-colors"
          />
        </div>

        <p className="text-[12px] italic text-gray-500 mb-5 leading-snug">
          Submitting this report will send the current response to Stoic for future improvements.
        </p>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 rounded-lg text-[14px] text-gray-300 bg-white/[0.05] hover:bg-white/[0.09] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit({ issueType, details })}
            className="px-4 py-1.5 rounded-lg text-[14px] font-medium text-black bg-white hover:bg-gray-200 transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AnswerActions({
  answerText = '',
  sourceCount = 0,
  onRegenerate,
  onShare,
  onFeedback,
  onOpenSources,
}) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [modalType, setModalType] = useState(null); // 'up' | 'down' | null
  const { speaking, toggle: toggleSpeak } = useReadAloud(answerText);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      answerText.replace(/⟦cite:[^⟧]+⟧/g, '').replace(/\*\*/g, '')
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const openFeedbackModal = (type) => {
    // clicking the same active icon again just clears it, like a toggle-off
    if (feedback === type) {
      setFeedback(null);
      onFeedback?.(null);
      return;
    }
    setModalType(type);
  };

  const closeModal = () => setModalType(null);

  const submitFeedback = ({ issueType, details }) => {
    setFeedback(modalType);
    onFeedback?.({ type: modalType, issueType: issueType || null, details: details || null });
    setModalType(null);
  };

  const iconBtn =
    "p-1.5 rounded-md text-gray-500 hover:text-gray-200 hover:bg-white/[0.06] transition-colors";
  const activeBtn = "text-[#7C83DB] bg-white/[0.06]";

  return (
    <div className="flex items-center gap-1 mt-3">
      <button onClick={handleCopy} className={iconBtn} title="Copy">
        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
      </button>

      <button
        onClick={() => openFeedbackModal('up')}
        className={`${iconBtn} ${feedback === 'up' ? activeBtn : ''}`}
        title="Good response"
      >
        <ThumbsUp size={16} />
      </button>

      <button
        onClick={() => openFeedbackModal('down')}
        className={`${iconBtn} ${feedback === 'down' ? activeBtn : ''}`}
        title="Bad response"
      >
        <ThumbsDown size={16} />
      </button>

      <button onClick={onShare} className={iconBtn} title="Share">
        <Share2 size={16} />
      </button>

      <button onClick={onRegenerate} className={iconBtn} title="Regenerate">
        <RotateCcw size={16} />
      </button>

      <button
        onClick={toggleSpeak}
        className={`${iconBtn} ${speaking ? activeBtn : ''}`}
        title={speaking ? 'Stop' : 'Read aloud'}
      >
        {speaking ? <Square size={15} /> : <Volume2 size={16} />}
      </button>

      {sourceCount > 0 && (
        <button
          onClick={onOpenSources}
          className="flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-md bg-white/[0.04] text-[12.5px] text-gray-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <BookOpen size={13} />
          <span>{sourceCount} source{sourceCount !== 1 ? 's' : ''}</span>
        </button>
      )}

      {modalType && (
        <FeedbackModal type={modalType} onCancel={closeModal} onSubmit={submitFeedback} />
      )}
    </div>
  );
}