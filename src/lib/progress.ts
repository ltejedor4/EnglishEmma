import type { WordProgress } from './review.ts';

export interface Progress {
  words: WordProgress;
  /** Días en que terminó una sesión (para la racha y para no repetir la ficha del día). */
  sessionDays: string[];
  /** Fichas de rompecabezas ganadas en total. */
  pieces: number;
}

const KEY = 'emma-english:v1';
export const EMPTY_PROGRESS: Progress = { words: {}, sessionDays: [], pieces: 0 };

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY_PROGRESS, ...JSON.parse(raw) } : EMPTY_PROGRESS;
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
