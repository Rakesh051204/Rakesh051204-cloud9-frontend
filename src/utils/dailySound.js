// src/utils/dailySound.js
// Rotates a small musical shift per calendar day, the same pattern as
// getDailyAccent() for color — so mic/voice activation tones feel
// different day to day instead of always playing the identical beep.
const DAY_STEPS = [0, 2, 4, 5, 7, 9, 11, 12]; // major-scale semitone steps

export function getDailyPitchRatio() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  const semitones = DAY_STEPS[dayOfYear % DAY_STEPS.length];
  return Math.pow(2, semitones / 12);
}