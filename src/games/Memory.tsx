import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Buddy } from '../components/Buddy.tsx';
import { cardClass, cardSize } from '../components/cardStyles.ts';
import { GameArea } from '../components/Screen.tsx';
import { Stars } from '../components/Stars.tsx';
import { WordCaption, WordImage } from '../components/WordImage.tsx';
import { randomCelebration, say } from '../lib/audio.ts';
import { image } from '../lib/images.ts';
import { keyOf, shuffle } from '../lib/review.ts';
import type { WordRef } from '../lib/review.ts';
import type { RoundResult } from './ListenTouch.tsx';

const clipOf = (ref: WordRef) => `${ref.topicId}/${ref.word.id}`;

/**
 * Memory: cartas boca abajo, cada una dice su palabra al voltearla; hay que encontrar los pares.
 * No evalúa (no hay respuesta "incorrecta"): es escuchar y repetir la palabra muchas veces jugando.
 */
export function Memory({ words, onDone }: { words: WordRef[]; onDone: (results: RoundResult[]) => void }) {
  const cards = useMemo(() => shuffle([...words, ...words]), [words]);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const back = image('card-back');
  const solved = matched.length === words.length;

  useEffect(() => {
    say('common/find-the-pairs');
  }, []);

  async function flip(i: number) {
    if (busy || solved || open.includes(i) || matched.includes(keyOf(cards[i]))) return;
    const nowOpen = [...open, i];
    setOpen(nowOpen);
    if (nowOpen.length < 2) {
      say(clipOf(cards[i]));
      return;
    }
    setBusy(true);
    const [a, b] = nowOpen.map((n) => cards[n]);
    if (keyOf(a) === keyOf(b)) {
      const nowMatched = [...matched, keyOf(a)];
      setMatched(nowMatched);
      setOpen([]);
      if (nowMatched.length === words.length) {
        if (await say(clipOf(a), randomCelebration())) onDone([]);
        return;
      }
      await say(clipOf(a));
    } else {
      // No son iguales: se escucha la segunda y se vuelven a tapar, sin ningún sonido de error.
      await say(clipOf(b));
      await new Promise((r) => setTimeout(r, 500));
      setOpen([]);
    }
    setBusy(false);
  }

  return (
    <GameArea>
      <Buddy pose={solved ? 'cheer' : 'listen'} size={100} />
      <div className="grid grid-cols-3 gap-4" data-memory>
        {cards.map((ref, i) => {
          const isMatched = matched.includes(keyOf(ref));
          const shown = isMatched || open.includes(i);
          return (
            <button
              key={i}
              className="relative size-(--size) [perspective:800px]"
              style={cardSize('min(26vw, 30vh, 190px)')}
              onClick={() => flip(i)}
              data-memory-card={keyOf(ref)}
              data-state={isMatched ? 'matched' : shown ? 'open' : 'closed'}
            >
              <motion.div
                className="relative size-full [transform-style:preserve-3d]"
                animate={{ rotateY: shown ? 180 : 0, scale: isMatched ? 0.94 : 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="absolute inset-0 grid place-items-center overflow-hidden rounded-[28px] bg-night-soft shadow-[0_8px_0_rgb(0_0_0/0.25)] [backface-visibility:hidden]">
                  {back ? <img src={back} alt="" className="size-full object-cover" draggable={false} /> : <span className="text-5xl">🐾</span>}
                </div>
                <div
                  className={`${cardClass} absolute inset-0 pb-[14%] [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                    isMatched ? 'border-success' : ''
                  }`}
                >
                  <WordImage target={ref} />
                  <WordCaption target={ref} />
                </div>
              </motion.div>
            </button>
          );
        })}
      </div>
      {solved && <Stars count={10} />}
    </GameArea>
  );
}
