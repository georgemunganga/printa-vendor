const SOUND_PREFERENCE_KEY = "printa-operational-sounds-enabled";

type OperationalSound = "new-order" | "success" | "error";

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  if (audioContext) return audioContext;
  const AudioContextConstructor = window.AudioContext
    ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) return null;
  audioContext = new AudioContextConstructor();
  return audioContext;
};

export const areOperationalSoundsEnabled = () => {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(SOUND_PREFERENCE_KEY) !== "false";
};

export const setOperationalSoundsEnabled = (enabled: boolean) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SOUND_PREFERENCE_KEY, String(enabled));
  }
  if (enabled) unlockOperationalSound();
};

export const unlockOperationalSound = () => {
  const context = getAudioContext();
  if (context?.state === "suspended") void context.resume();
};

export const playOperationalSound = (sound: OperationalSound) => {
  if (!areOperationalSoundsEnabled()) return;
  const context = getAudioContext();
  if (!context) return;

  void context.resume().then(() => {
    const notes = sound === "new-order"
      ? [{ frequency: 740, start: 0, duration: 0.16 }, { frequency: 988, start: 0.18, duration: 0.28 }]
      : sound === "success"
        ? [{ frequency: 660, start: 0, duration: 0.12 }, { frequency: 880, start: 0.13, duration: 0.2 }]
        : [{ frequency: 220, start: 0, duration: 0.16 }, { frequency: 165, start: 0.17, duration: 0.2 }];

    const now = context.currentTime;
    notes.forEach(({ frequency, start, duration }) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now + start);
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(0.12, now + start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now + start);
      oscillator.stop(now + start + duration + 0.02);
    });
  }).catch(() => undefined);
};
