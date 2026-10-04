import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import { Buddy } from '../components/Buddy.tsx';
import { NextButton } from '../components/NextButton.tsx';
import { Stars } from '../components/Stars.tsx';
import type { Topic } from '../content/types.ts';
import { randomCelebration, say } from '../lib/audio.ts';
import { puzzleImage } from '../lib/images.ts';

export const PUZZLE_COLS = 3;
export const PUZZLE_ROWS = 2;
export const PUZZLE_PIECES = PUZZLE_COLS * PUZZLE_ROWS;

function pieceStyle(src: string, index: number): CSSProperties {
  const col = index % PUZZLE_COLS;
  const row = Math.floor(index / PUZZLE_COLS);
  return {
    backgroundImage: `url("${src}")`,
    backgroundSize: `${PUZZLE_COLS * 100}% ${PUZZLE_ROWS * 100}%`,
    backgroundPosition: `${(col / (PUZZLE_COLS - 1)) * 100}% ${(row / (PUZZLE_ROWS - 1)) * 100}%`,
  };
}

interface Props {
  topic: Topic;
  /** Fichas ya colocadas en este rompecabezas; la nueva va en la posición siguiente. */
  placedBefore: number;
  onDone: () => void;
}

/** ¡Ficha nueva! Llega volando y Emma la arrastra a su lugar. */
export function PuzzleScreen({ topic, placedBefore, onDone }: Props) {
  const src = puzzleImage(topic, PUZZLE_COLS, PUZZLE_ROWS);
  const target = placedBefore;
  const finished = target + 1 === PUZZLE_PIECES;
  const slotRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    say('common/new-puzzle-piece', 'common/put-the-piece');
  }, []);

  async function drop(point: { x: number; y: number }) {
    const slot = slotRef.current?.getBoundingClientRect();
    if (!slot) return;
    // Mucha tolerancia: basta con soltarla cerca.
    const tolerance = slot.width * 0.6;
    const near =
      point.x > slot.left - tolerance &&
      point.x < slot.right + tolerance &&
      point.y > slot.top - tolerance &&
      point.y < slot.bottom + tolerance;
    if (!near) return;
    setPlaced(true);
    await say(randomCelebration(), ...(finished ? ['common/puzzle-finished'] : []));
    setReady(true);
  }

  return (
    <main className="screen puzzle-screen">
      <Buddy pose={placed ? 'cheer' : 'puzzle'} size={110} />
      <div className="board">
        {Array.from({ length: PUZZLE_PIECES }, (_, i) => {
          const filled = i < target || (i === target && placed);
          return (
            <div
              key={i}
              ref={i === target ? slotRef : undefined}
              className={`slot ${filled ? 'filled' : ''} ${i === target && !placed ? 'target' : ''}`}
              style={filled ? pieceStyle(src, i) : undefined}
            />
          );
        })}
        {placed && finished && <Stars count={12} />}
      </div>
      <div className="tray">
        {!placed && (
          <motion.div
            className="piece"
            style={pieceStyle(src, target)}
            initial={{ y: -400, rotate: -30, scale: 0.4 }}
            animate={{ y: 0, rotate: 0, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 1 }}
            drag
            dragSnapToOrigin
            whileDrag={{ scale: 1.1, zIndex: 10 }}
            onDragEnd={(_, info) => drop(info.point)}
          />
        )}
        {ready && <NextButton onClick={onDone} />}
      </div>
    </main>
  );
}
