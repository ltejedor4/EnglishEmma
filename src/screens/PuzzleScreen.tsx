import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Buddy } from '../components/Buddy.tsx';
import { NextButton } from '../components/NextButton.tsx';
import { SceneBoard } from '../components/SceneBoard.tsx';
import { Screen } from '../components/Screen.tsx';
import { Stars } from '../components/Stars.tsx';
import type { Topic } from '../content/types.ts';
import { randomCelebration, say } from '../lib/audio.ts';
import { droppedNear } from '../lib/drag.ts';
import { puzzleImage } from '../lib/images.ts';
import { PUZZLE_COLS, PUZZLE_PIECES, PUZZLE_ROWS, pieceStyle } from '../lib/puzzle.ts';

interface Props {
  topic: Topic;
  /** Fichas ya colocadas en este rompecabezas; la nueva va en la posición siguiente. */
  placedBefore: number;
  onDone: () => void;
}

/** ¡Ficha nueva! Llega volando y Emma la arrastra a su lugar. Con la última, el rompecabezas cobra vida. */
export function PuzzleScreen({ topic, placedBefore, onDone }: Props) {
  const src = puzzleImage(topic, PUZZLE_COLS, PUZZLE_ROWS);
  const target = placedBefore;
  const finished = target + 1 === PUZZLE_PIECES;
  const slotRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState(false);
  const [ready, setReady] = useState(false);
  // Rompecabezas completo: la última cosa que tocó (dice su palabra).
  const [touched, setTouched] = useState<string | null>(null);
  const alive = finished && ready;

  useEffect(() => {
    say('common/new-puzzle-piece', 'common/put-the-piece');
  }, []);

  async function drop(point: { x: number; y: number }) {
    if (!droppedNear(point, slotRef.current?.getBoundingClientRect())) return;
    setPlaced(true);
    await say(randomCelebration(), ...(finished ? ['common/puzzle-finished', 'common/touch-to-listen'] : []));
    setReady(true);
  }

  return (
    <Screen className="gap-4 [--board-w:min(84vw,calc(100dvh-200px),720px)]">
      <Buddy pose={placed ? 'cheer' : 'puzzle'} size={110} />
      {alive ? (
        <SceneBoard
          topic={topic}
          marked={touched ? [touched] : []}
          className="w-(--board-w)"
          onTouch={(wordId) => {
            setTouched(wordId);
            say(`${topic.id}/${wordId}`);
          }}
        />
      ) : (
        <div data-board className="relative grid aspect-3/2 w-(--board-w) grid-cols-3 grid-rows-2 gap-1 rounded-[20px] bg-white/10 p-1">
          {Array.from({ length: PUZZLE_PIECES }, (_, i) => {
            const filled = i < target || (i === target && placed);
            return (
              <div
                key={i}
                ref={i === target ? slotRef : undefined}
                data-slot={filled ? 'filled' : i === target ? 'target' : 'empty'}
                className={`rounded-[10px] ${
                  filled ? '' : i === target ? 'animate-glow border-3 border-dashed border-moon' : 'border-3 border-dashed border-white/25'
                }`}
                style={filled ? pieceStyle(src, i) : undefined}
              />
            );
          })}
          {placed && finished && <Stars count={12} />}
        </div>
      )}
      <div className="flex min-h-[calc(var(--board-w)/3)] items-center justify-center gap-6">
        {!placed && (
          <motion.div
            data-piece
            className="aspect-square w-[calc(var(--board-w)/3-6px)] cursor-grab touch-none rounded-[10px] shadow-[0_10px_24px_rgb(0_0_0/0.4)]"
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
    </Screen>
  );
}
