import type { Topic } from '../content/types.ts';
import { puzzleImage } from '../lib/images.ts';
import { PUZZLE_COLS, PUZZLE_PIECES, PUZZLE_ROWS, pieceStyle } from '../lib/puzzle.ts';

/** Rompecabezas del álbum, sin interacción: las fichas ya puestas y los huecos de las que faltan. */
export function PuzzleBoard({ topic, filled, className = '' }: { topic: Topic; filled: number; className?: string }) {
  const src = puzzleImage(topic, PUZZLE_COLS, PUZZLE_ROWS);
  return (
    <div className={`grid aspect-3/2 grid-cols-3 grid-rows-2 gap-[1.5%] ${className}`} data-puzzle={topic.id} data-filled={filled}>
      {Array.from({ length: PUZZLE_PIECES }, (_, i) => (
        <div
          key={i}
          className={`rounded-[8%] ${i < filled ? '' : 'border-2 border-dashed border-white/40 bg-night/45'}`}
          style={i < filled ? pieceStyle(src, i) : undefined}
        />
      ))}
    </div>
  );
}
