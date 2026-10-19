type Note = { frequency: number; start: number; duration: number };

// Focus finished: bright rising arpeggio (C5 → E5 → G5 → C6).
const FOCUS_COMPLETE_NOTES: Note[] = [
  { frequency: 523.25, start: 0, duration: 0.35 },
  { frequency: 659.25, start: 0.15, duration: 0.35 },
  { frequency: 783.99, start: 0.3, duration: 0.35 },
  { frequency: 1046.5, start: 0.45, duration: 0.7 },
];

// Break finished: softer two-tone "back to work" chime (G5 → C5, twice).
const BREAK_COMPLETE_NOTES: Note[] = [
  { frequency: 783.99, start: 0, duration: 0.4 },
  { frequency: 523.25, start: 0.25, duration: 0.5 },
  { frequency: 783.99, start: 0.8, duration: 0.4 },
  { frequency: 523.25, start: 1.05, duration: 0.7 },
];

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const AudioContextClass =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
  }
  return audioContext;
}

// Browsers only allow audio after a user gesture, so call this from a click handler.
export function unlockAudio() {
  const context = getAudioContext();
  if (context?.state === "suspended") void context.resume();
}

function playNotes(notes: Note[]) {
  const context = getAudioContext();
  if (!context) return;
  if (context.state === "suspended") void context.resume();

  const now = context.currentTime;
  for (const note of notes) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startAt = now + note.start;
    const endAt = startAt + note.duration;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(note.frequency, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.3, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

    oscillator.connect(gain).connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(endAt + 0.05);
  }
}

export function playFocusCompleteSound() {
  playNotes(FOCUS_COMPLETE_NOTES);
}

export function playBreakCompleteSound() {
  playNotes(BREAK_COMPLETE_NOTES);
}
