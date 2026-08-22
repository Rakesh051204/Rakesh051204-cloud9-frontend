import React, { useState, useEffect, useRef } from 'react';

const AskBox = ({ onSubmit }) => {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSubmit?.(value.trim());
        setValue('');
      }
    }
  };

  return (
    <div className={`ask-box ${focused ? 'ask-box-focused' : ''}`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Ask anything"
        rows={1}
        className="ask-box-input"
      />
      <button
        className="ask-box-send"
        disabled={!value.trim()}
        onClick={() => {
          if (value.trim()) {
            onSubmit?.(value.trim());
            setValue('');
          }
        }}
        aria-label="Send"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 13V3M8 3L3 8M8 3l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
};

export default AskBox;