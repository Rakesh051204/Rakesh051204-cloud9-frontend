import { useState } from 'react';
import IncognitoLogo from './IncognitoLogo';

/**
 * IncognitoLanding
 * The "You're incognito" screen shown when private mode is active —
 * heading + a search box that visibly reacts when you click into it
 * (border goes from dashed-and-dim to solid-and-lit, background
 * lightens a touch), the same way Claude's own incognito screen does.
 *
 * Usage:
 *   <IncognitoLanding onSubmit={(text) => sendMessage(text)} />
 */
export default function IncognitoLanding({ onSubmit }) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit?.(value.trim());
    setValue('');
  }

  return (
    <div className="incognito-landing">
      <div className="incognito-heading">
        <IncognitoLogo size={34} active bg="#0A0A0A" />
        <h1>You're incognito</h1>
      </div>

      <form onSubmit={handleSubmit} className={`incognito-searchbox${focused ? ' is-focused' : ''}`}>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Type @ for connectors"
          className="incognito-input"
        />
        <div className="incognito-toolbar">
          <button type="button" className="tool-pill" aria-label="Add">
            +
          </button>
          <button type="button" className="tool-pill">
            Search
          </button>
          <button type="button" className="tool-pill">
            Computer
          </button>
          <span className="spacer" />
          <button type="submit" className="send-btn" aria-label="Send">
            ↑
          </button>
        </div>
      </form>

      <p className="incognito-note">
        Sessions you create won't be saved to your history and will expire after 24 hours
      </p>

      <style>{`
        .incognito-landing {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 4rem 1rem 2rem;
          background: #0A0A0A;
        }
        .incognito-heading {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
        }
        .incognito-heading h1 {
          font-size: 28px;
          font-weight: 500;
          color: #F2F2F0;
          margin: 0;
        }

        .incognito-searchbox {
          width: 100%;
          max-width: 640px;
          padding: 16px 18px 12px;
          background: #1C1C1A;
          border: 1px dashed rgba(255, 255, 255, 0.16);
          border-radius: 20px;
          transition: border-color 0.22s ease, background 0.22s ease, box-shadow 0.22s ease;
        }
        .incognito-searchbox.is-focused {
          border-style: solid;
          border-color: rgba(124, 131, 219, 0.55);
          background: #222220;
          box-shadow: 0 0 0 3px rgba(124, 131, 219, 0.14);
        }

        .incognito-input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: #F2F2F0;
          font-size: 16px;
          padding: 4px 0 14px;
        }
        .incognito-input::placeholder {
          color: #7A7A76;
        }

        .incognito-toolbar {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tool-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.06);
          border: none;
          border-radius: 999px;
          color: #D8D8D5;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .tool-pill:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .spacer {
          flex: 1;
        }
        .send-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F2F2F0;
          color: #0A0A0A;
          border: none;
          border-radius: 50%;
          font-size: 16px;
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .send-btn:hover {
          transform: scale(1.06);
        }

        .incognito-note {
          margin-top: 20px;
          font-size: 13px;
          color: #7A7A76;
          text-align: center;
        }
      `}</style>
    </div>
  );
}