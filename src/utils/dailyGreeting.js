// ─── Time-of-day greeting phrases ────────────────────────────────────
const GREETING_BANK = {
  morning: ["Good morning", "Rise and shine", "Morning has arrived", "What's cooking"],
  afternoon: ["Good afternoon", "Hope the day's treating you well", "Back at it", "What's cooking"],
  evening: ["Good evening", "Winding down", "Evening's here", "What's cooking"],
};

// ─── Daily rotating taglines (in Stoic's own voice) ──────────────────
const TAGLINE_BANK = {
  morning: [
    "The right habits make willpower almost unnecessary.",
    "Small starts compound faster than big plans.",
    "Clarity comes before momentum, not after.",
    "A calm mind gets more done before noon than a rushed one does all day.",
  ],
  afternoon: [
    "Steady effort outlasts a burst of motivation.",
    "Progress hides in the unglamorous middle of the day.",
    "What you finish today, you don't have to carry tomorrow.",
    "Focus is a decision you make again, not one you make once.",
  ],
  evening: [
    "Rest is part of the work, not a break from it.",
    "Reflection turns a day into a lesson.",
    "Tomorrow's clarity starts with tonight's rest.",
    "What went well today is worth noticing before it's forgotten.",
  ],
};

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / 86400000);
}

function getTimeSlot(date) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
}

export function getDailyGreeting(name = "there") {
  const now = new Date();
  const slot = getTimeSlot(now);
  const seed = dayOfYear(now);

  const greetings = GREETING_BANK[slot];
  const taglines = TAGLINE_BANK[slot];

  const greetingPhrase = greetings[seed % greetings.length];
  const tagline = taglines[(seed + 1) % taglines.length];

  const isQuestion = greetingPhrase.toLowerCase().startsWith("what's cooking");
  const text = isQuestion ? `${greetingPhrase}, ${name}?` : `${greetingPhrase}, ${name}`;

  return { text, tagline, slot };
}