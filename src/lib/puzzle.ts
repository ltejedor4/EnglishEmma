import type { CSSProperties } from 'react';

export const PUZZLE_COLS = 3;
export const PUZZLE_ROWS = 2;
export const PUZZLE_PIECES = PUZZLE_COLS * PUZZLE_ROWS;

/** Ancho de una escena a pantalla completa: lo más grande posible sin quedar debajo del 🔊 (arriba a la derecha). */
export const SCENE_WIDTH =
  'w-[max(min(92vw,calc((100dvh-250px)*1.5)),min(calc(100vw-230px),calc((100dvh-90px)*1.5)))]';

/** Fondo de una ficha: el trozo de la imagen que le toca según su posición. */
export function pieceStyle(src: string, index: number): CSSProperties {
  const col = index % PUZZLE_COLS;
  const row = Math.floor(index / PUZZLE_COLS);
  return {
    backgroundImage: `url("${src}")`,
    backgroundSize: `${PUZZLE_COLS * 100}% ${PUZZLE_ROWS * 100}%`,
    backgroundPosition: `${(col / (PUZZLE_COLS - 1)) * 100}% ${(row / (PUZZLE_ROWS - 1)) * 100}%`,
  };
}
