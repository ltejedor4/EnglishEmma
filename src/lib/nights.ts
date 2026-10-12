import { today } from './review.ts';

/** El día (YYYY-MM-DD) que queda `offset` días después de `day` (negativo = antes). */
export function addDays(day: string, offset: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return today(new Date(y, m - 1, d + offset));
}

/** Las últimas `count` noches hasta hoy (la más vieja primero), con si jugó o no. */
export function lastNights(sessionDays: string[], day: string, count = 7): { day: string; played: boolean }[] {
  return Array.from({ length: count }, (_, i) => {
    const night = addDays(day, i - count + 1);
    return { day: night, played: sessionDays.includes(night) };
  });
}

/** Racha: noches seguidas jugadas hasta hoy. Si hoy todavía no jugó, la de ayer sigue en pie. */
export function streak(sessionDays: string[], day: string): number {
  const played = new Set(sessionDays);
  let last = played.has(day) ? day : addDays(day, -1);
  let count = 0;
  while (played.has(last)) {
    count++;
    last = addDays(last, -1);
  }
  return count;
}

/** Rompecabezas del álbum: cuántas fichas tiene puestas cada uno (de `size`), con `pieces` ganadas en total. */
export function puzzleFill(pieces: number, puzzles: number, size: number): number[] {
  return Array.from({ length: puzzles }, (_, i) => Math.max(0, Math.min(size, pieces - i * size)));
}
