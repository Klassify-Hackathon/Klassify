// Design tokens. High contrast and large sizes on purpose: the app is for people
// who have seconds to decide and may not be confident with technology.
export const colors = {
  bg: '#F4F6FA',
  card: '#FFFFFF',
  ink: '#14193A',
  muted: '#566079',
  line: '#E0E5EF',
  primary: '#2B2A7A',
  primarySoft: '#E9E9FA',
  // Result states. Never rely on color alone: each also has an icon and a text label.
  fake: '#B3261E',
  fakeSoft: '#FDECEA',
  unsure: '#8A5A00',
  unsureSoft: '#FFF4DB',
  ok: '#1B6B4A',
  okSoft: '#E4F5EC',
};

export const space = { xs: 6, s: 10, m: 16, l: 24, xl: 32 };
export const radius = { m: 14, l: 24, pill: 999 };

// Flip these only when the feature really exists, so the UI never promises more than the app does.
export const FEATURES = {
  shareTip: false, // true once share-to-app from WhatsApp works (needs a development build)
};

// The analysis in src/lib/analyze.ts is a demo until it calls your backend.
export const IS_MOCK = true;