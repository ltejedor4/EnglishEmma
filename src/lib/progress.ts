import type { WordProgress } from './review.ts';
import type { SpeechMode } from './speech.ts';

export interface Settings {
  /** "Your turn! Say it!": automático (reconocimiento), grabar y escucharse, o apagado. */
  speech: SpeechMode;
}

export interface Progress {
  words: WordProgress;
  /** Días en que terminó una sesión (para la racha y para no repetir la ficha del día). */
  sessionDays: string[];
  /** Fichas de rompecabezas ganadas en total. */
  pieces: number;
  /** Palabras que dijo bien en voz alta → días en que las dijo. No afecta el repaso. */
  spoken: Record<string, string[]>;
  settings: Settings;
  /** Último problema con el micrófono (permiso denegado, sin servicio…), para avisar en la zona de padres. */
  speechIssue?: string;
}

const KEY = 'emma-english:v1';
export const DEFAULT_SETTINGS: Settings = { speech: 'auto' };
export const EMPTY_PROGRESS: Progress = { words: {}, sessionDays: [], pieces: 0, spoken: {}, settings: DEFAULT_SETTINGS };

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY_PROGRESS;
    const saved = JSON.parse(raw);
    // Lo guardado antes de que existieran algunos campos se completa con los valores por defecto.
    return { ...EMPTY_PROGRESS, ...saved, settings: { ...DEFAULT_SETTINGS, ...saved.settings } };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Sin almacenamiento (modo privado): el juego sigue funcionando, solo no recuerda.
  }
}

/** Anota las palabras que dijo bien hoy. */
export function recordSpoken(spoken: Progress['spoken'], keys: string[], day: string): Progress['spoken'] {
  const next = { ...spoken };
  for (const key of keys) {
    const days = next[key] ?? [];
    next[key] = days.includes(day) ? days : [...days, day];
  }
  return next;
}
