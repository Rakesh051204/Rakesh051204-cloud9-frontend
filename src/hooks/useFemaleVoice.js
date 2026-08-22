import { useEffect, useRef, useState } from 'react';

// Ranked by how natural they tend to sound, best first.
// Edge/Chrome on Windows expose the "Online (Natural)" voices which are
// genuinely decent; Zira is the offline fallback. Safari/macOS gets Samantha.
const PREFERRED_FEMALE_VOICES = [
  'Microsoft Aria Online (Natural) - English (United States)',
  'Microsoft Jenny Online (Natural) - English (United States)',
  'Google UK English Female',
  'Google US English',
  'Samantha',
  'Microsoft Zira - English (United States)',
  'Karen',
  'Moira',
  'Tessa',
  'Veena',
];

function scoreVoice(v) {
  const idx = PREFERRED_FEMALE_VOICES.indexOf(v.name);
  if (idx !== -1) return 1000 - idx;
  if (/female/i.test(v.name)) return 10;
  if (/zira|aria|jenny|samantha|susan|karen|natural/i.test(v.name)) return 8;
  return 0;
}

export function useFemaleVoice() {
  const [voice, setVoice] = useState(null);
  const [voices, setVoices] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    function pickVoice() {
      const all = window.speechSynthesis.getVoices();
      if (!all.length) return;
      const english = all.filter((v) => v.lang.startsWith('en'));
      const pool = english.length ? english : all;
      const best = [...pool].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
      setVoices(all);
      setVoice(best || null);
      setReady(true);
    }

    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  function speak(text, opts = {}) {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    if (voice) utter.voice = voice;
    // Slightly higher pitch + a touch slower reads as warmer/"sweeter"
    // than the 1.0/1.0 default without tipping into cartoonish.
    utter.rate = opts.rate ?? 0.97;
    utter.pitch = opts.pitch ?? 1.12;
    utter.volume = opts.volume ?? 1;
    if (opts.onEnd) utter.onend = opts.onEnd;
    window.speechSynthesis.speak(utter);
    return utter;
  }

  function stop() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  return { voice, voices, ready, speak, stop };
}