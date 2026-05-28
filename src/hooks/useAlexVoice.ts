import { useEffect, useCallback } from 'react';

// ── Audio clip name map ───────────────────────────────────────────────────
// Values are exact filenames (including extension) relative to /sounds/
export const ALEX_CLIPS = {
  // Tutorial (7 steps → paso1.mp3 … paso7.mp3)
  TUTORIAL_1:           'paso1.mp3',
  TUTORIAL_2:           'paso2.mp3',
  TUTORIAL_3:           'paso3.mp3',
  TUTORIAL_4:           'paso4.mp3',
  TUTORIAL_5:           'paso5.mp3',
  TUTORIAL_6:           'paso6.mp3',
  TUTORIAL_7:           'paso7.mp3',
  // Day transitions
  DIA_2_TABLERO:        'dia 2 tablero.mp3',
  // Classification outcomes
  CASO_INSERTADO:       'caso insertado en el arbol.mp3',
  POSITIVO_COMO_DELITO: 'comentario positivo como delito.mp3',
  DELITO_COMO_NONE:     'delito real como none.mp3',
} as const;

export type AlexClip = typeof ALEX_CLIPS[keyof typeof ALEX_CLIPS];

/** Ordered array of tutorial clips — index matches tutorial step (0-based). */
export const TUTORIAL_CLIPS: AlexClip[] = [
  ALEX_CLIPS.TUTORIAL_1,
  ALEX_CLIPS.TUTORIAL_2,
  ALEX_CLIPS.TUTORIAL_3,
  ALEX_CLIPS.TUTORIAL_4,
  ALEX_CLIPS.TUTORIAL_5,
  ALEX_CLIPS.TUTORIAL_6,
  ALEX_CLIPS.TUTORIAL_7,
];

// ── Module-level singleton ────────────────────────────────────────────────
// One shared audio element across all React renders — prevents overlapping clips.
const alexAudio: { current: HTMLAudioElement | null; enabled: boolean } = {
  current: null,
  enabled: true,
};

/**
 * Syncs the module-level enabled flag.
 * Called automatically by the React hook and can also be called imperatively.
 */
export function setAlexVoiceEnabled(enabled: boolean): void {
  alexAudio.enabled = enabled;
  if (!enabled && alexAudio.current) {
    alexAudio.current.pause();
    alexAudio.current.currentTime = 0;
  }
}

/**
 * Plays a pre-recorded Alex audio clip.
 * Safe to call from anywhere — including non-React contexts like useGameState.ts.
 * Stops any currently playing clip before starting the new one.
 */
export function playAlexClip(clip: AlexClip): void {
  if (!alexAudio.enabled) return;
  if (alexAudio.current) {
    alexAudio.current.pause();
    alexAudio.current.currentTime = 0;
  }
  const audio = new Audio('/sounds/' + clip);
  alexAudio.current = audio;
  audio.play().catch(err => {
    console.warn(`[AlexVoice] Cannot play "${clip}":`, err);
  });
}

/** Stops whatever Alex clip is currently playing. */
export function stopAlexClip(): void {
  if (alexAudio.current) {
    alexAudio.current.pause();
    alexAudio.current.currentTime = 0;
    alexAudio.current = null;
  }
}

// ── React hook ────────────────────────────────────────────────────────────
/**
 * Wires the React `isVoiceEnabled` state to the module singleton.
 * Mount this once (e.g. in App.tsx) to keep the singleton in sync.
 * Components that only need to play audio can import `playAlexClip` directly.
 */
export function useAlexVoice(isVoiceEnabled: boolean) {
  useEffect(() => {
    setAlexVoiceEnabled(isVoiceEnabled);
  }, [isVoiceEnabled]);

  const play = useCallback((clip: AlexClip) => playAlexClip(clip), []);
  const stop = useCallback(() => stopAlexClip(), []);

  return { play, stop };
}
