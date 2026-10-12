import { motion } from 'motion/react';
import { scenes } from '../content/scenes.ts';
import type { Topic } from '../content/types.ts';
import { puzzleImage } from '../lib/images.ts';
import { PUZZLE_COLS, PUZZLE_ROWS } from '../lib/puzzle.ts';

interface Props {
  topic: Topic;
  /** Tocó una de las cosas de la escena (id de la palabra). Tocar el fondo no hace nada. */
  onTouch: (wordId: string) => void;
  /** Palabras que quedan marcadas con un aro de luz (la que encontró o acaba de sonar). */
  marked?: string[];
  /** Palabra que se mueve suavemente tras un error. */
  shaking?: string | null;
  className?: string;
}

/** La escena del rompecabezas de un tema, con cada cosa tocable (zonas en src/content/scenes.ts). */
export function SceneBoard({ topic, onTouch, marked = [], shaking = null, className = '' }: Props) {
  const spots = Object.entries(scenes[topic.id] ?? {}).flatMap(([wordId, list]) => list.map((spot) => ({ wordId, spot })));
  return (
    <div className={`relative aspect-3/2 overflow-hidden rounded-[20px] ${className}`} data-scene={topic.id}>
      <img src={puzzleImage(topic, PUZZLE_COLS, PUZZLE_ROWS)} alt="" draggable={false} className="pointer-events-none size-full" />
      {spots.map(({ wordId, spot: [cx, cy, rx, ry] }, i) => {
        const on = marked.includes(wordId);
        return (
          <motion.button
            key={i}
            className={`absolute rounded-[50%] border-4 bg-transparent p-0 ${
              on ? 'border-moon shadow-[0_0_0_6px_rgb(255_233_168/0.45)]' : 'border-transparent'
            }`}
            style={{ left: `${cx - rx}%`, top: `${cy - ry}%`, width: `${rx * 2}%`, height: `${ry * 2}%` }}
            animate={shaking === wordId ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0, scale: on ? 1.06 : 1 }}
            whileTap={{ scale: 1.1 }}
            transition={{ duration: 0.4 }}
            onClick={() => onTouch(wordId)}
            data-spot={wordId}
            aria-label={wordId}
          />
        );
      })}
    </div>
  );
}
