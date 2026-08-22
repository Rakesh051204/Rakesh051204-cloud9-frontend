import { useState, useEffect } from 'react';
import { getDailyGreeting } from '../utils/dailyGreeting';

const LIGHT_TEXT = '#F2F2F0';
const LIGHT_TEXT_SOFT = 'rgba(242,242,240,0.55)';

export default function GreetingHeader({ userName = 'there' }) {
  const [greeting, setGreeting] = useState(() => getDailyGreeting(userName));

  // Re-check every minute so the greeting flips from "morning" to
  // "afternoon" etc. if the tab is left open across a time boundary.
  useEffect(() => {
    setGreeting(getDailyGreeting(userName));
    const interval = setInterval(() => {
      setGreeting(getDailyGreeting(userName));
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [userName]);

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <h1
        className="text-[32px] sm:text-[38px] leading-tight"
        style={{ color: LIGHT_TEXT, fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        {greeting.text}
      </h1>
      <p className="italic text-[15px]" style={{ color: LIGHT_TEXT_SOFT }}>
        {greeting.tagline}
      </p>
    </div>
  );
}