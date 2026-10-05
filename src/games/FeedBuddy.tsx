import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Buddy } from '../components/Buddy.tsx';
import { cardClass, cardSize } from '../components/cardStyles.ts';
import { GameArea } from '../components/Screen.tsx';
import { SpeakerButton } from '../components/SpeakerButton.tsx';
import { Stars } from '../components/Stars.tsx';
import { WordCaption, WordImage } from '../components/WordImage.tsx';
import { say } from '../lib/audio.ts';
import { droppedNear } from '../lib/drag.ts';
import { keyOf } from '../lib/review.ts';
import type { WordRef } from '../lib/review.ts';
import type { RoundResult } from './ListenTouch.tsx';

export interface FeedRound {
  target: WordRef;
  options: WordRef[];
}

const clipOf = (ref: WordRef) => `${ref.topicId}/${ref.word.id}`;

/** Feed Buddy: "Give me… apple!" → arrastrar (o tocar) la tarjeta hasta Buddy. */
export function FeedBuddy({ rounds, onDone }: { rounds: FeedRound[]; onDone: (results: RoundResult[]) => void }) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const round = rounds[index];
  const prompt = useMemo(() => ['common/give-me', clipOf(round.target)], [round]);

  useEffect(() => {
    say(...(index === 0 ? ['common/im-hungry'] : []), ...prompt);
  }, [index, prompt]);

  function finishRound(firstTry: boolean) {
    const all = [...results, { target: round.target, firstTry }];
    if (index + 1 < rounds.length) {
      setResults(all);
      setIndex(index + 1);
    } else onDone(all);
  }

  return (
    <GameArea>
      <SpeakerButton onClick={() => say(...prompt)} />
      <FeedRoundView key={index} round={round} prompt={prompt} onDone={finishRound} />
    </GameArea>
  );
}

function FeedRoundView({ round, prompt, onDone }: { round: FeedRound; prompt: string[]; onDone: (firstTry: boolean) => void }) {
  const buddyRef = useRef<HTMLDivElement>(null);
  const [fed, setFed] = useState(false);
  const [missed, setMissed] = useState(false);
  const [shaking, setShaking] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Al soltar después de arrastrar, el navegador también dispara un "click": se ignora ese.
  const justDragged = useRef(false);

  async function give(ref: WordRef) {
    if (busy || fed) return;
    if (keyOf(ref) === keyOf(round.target)) {
      setFed(true);
      if (await say(clipOf(ref), 'common/yummy')) onDone(!missed);
      return;
    }
    setMissed(true);
    setShaking(keyOf(ref));
    setBusy(true);
    await say('common/try-again');
    setBusy(false);
    setShaking(null);
  }

  return (
    <div className="flex size-full flex-col items-center justify-around" data-feed={prompt.join(' ')}>
      <motion.div
        ref={buddyRef}
        className="relative grid place-items-center rounded-full"
        animate={fed ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        data-feed-buddy
      >
        <Buddy pose={fed ? 'cheer' : 'hungry'} size={170} />
        {fed && <Stars />}
      </motion.div>
      <div className="flex flex-wrap justify-center gap-6">
        <AnimatePresence>
          {round.options.map((ref) => {
            const key = keyOf(ref);
            const isTarget = key === keyOf(round.target);
            if (fed && isTarget) return null;
            return (
              <motion.button
                key={key}
                className={`${cardClass} cursor-grab touch-none pb-[14%]`}
                style={cardSize('min(26vw, 30vh, 200px)')}
                drag
                dragSnapToOrigin
                whileDrag={{ scale: 1.1, zIndex: 10 }}
                animate={shaking === key ? { x: [0, -14, 14, -10, 10, 0] } : { x: 0 }}
                exit={{ scale: 0.2, opacity: 0, y: -120, transition: { duration: 0.4 } }}
                onDragStart={() => (justDragged.current = true)}
                onDragEnd={(_, info) => {
                  if (droppedNear(info.point, buddyRef.current?.getBoundingClientRect(), 0.3)) give(ref);
                  setTimeout(() => (justDragged.current = false), 50);
                }}
                onClick={() => !justDragged.current && give(ref)}
                data-feed-card={key}
              >
                <WordImage target={ref} />
                <WordCaption target={ref} />
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
