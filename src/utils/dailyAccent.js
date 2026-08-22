// src/utils/dailyAccent.js
const ACCENTS = ["#7C83DB", "#C97B96", "#5FB8D6"]; // periwinkle, mauve, cyan

export function getDailyAccent() {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now - new Date(now.getFullYear(), 0, 0)) / 86400000
  );
  return ACCENTS[dayOfYear % ACCENTS.length];
}