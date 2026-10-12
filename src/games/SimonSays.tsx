import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Buddy } from '../components/Buddy.tsx';
import { cardClass, cardSize } from '../components/cardStyles.ts';
import { GameArea } from '../components/Screen.tsx';
import { SpeakerButton } from '../components/SpeakerButton.tsx';
import { Stars } from '../components/Stars.tsx';
import { WordCaption, WordImage } from '../components/WordImage.tsx';
import { randomCelebration, say } from '../lib/audio.ts';
import type { WordRef } from '../lib/review.ts';
import type { RoundResult } from './ListenTouch.tsx';

const clipOf = (ref: WordRef) => `${ref.topicId}/${ref.word.id}`;

/**
 * Simon Says: "Simon says: Touch your nose!" → Emma lo hace de verdad y toca ✅.
 * No evalúa (papá/mamá está al lado y la ve): la tarjeta aparece después, para que primero escuche.
 */
export function SimonSays({ targets, onDone }: { targets: WordRef[]; onDone: (results: RoundResult[]) => void }) {
  const [index, setIndex] = useState(0);
  // listening = Buddy da la orden · ready = ya puede tocar ✅ · done = lo hizo
  const [phase, setPhase] = useState<'listening' | 'ready' | 'done'>('listening');
  const target = targets[index];
  const prompt = useMemo(() => ['common/simon-says', `${clipOf(target)}-fact-1`], [target]);
  const order = () => say(...prompt).then((finished) => finished && setPhase((p) => (p === 'listening' ? 'ready' : p)));

  useEffect(() => {
    say(...prompt).then((finished) => finished && setPhase((p) => (p === 'listening' ? 'ready' : p)));
  }, [prompt]);

  async function did() {
    setPhase('done');
    if (!(await say(clipOf(target), randomCelebration()))) return;
    if (index + 1 >= targets.length) return onDone([]);
    setPhase('listening');
    setIndex(index + 1);
  }

  return (
    <GameArea>
      <SpeakerButton onClick={() => phase !== 'done' && order()} />
      <Buddy pose={phase === 'done' ? 'cheer' : 'point'} size={170} />
      <div className="relative grid min-h-[min(40vw,34vh,230px)] place-items-center" data-simon={prompt.join(' ')}>
        {phase === 'ready' && (
          <motion.button
            className="moon-button size-28"
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
            onClick={did}
            aria-label="Done"
            data-simon-done
          >
            <svg viewBox="0 0 24 24" className="size-16" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 13l4.5 4.5L19 7" />
            </svg>
          </motion.button>
        )}
        {phase === 'done' && (
          <motion.div
            className={`${cardClass} pb-[14%]`}
            style={cardSize('min(40vw, 34vh, 230px)')}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
          >
            <WordImage target={target} />
            <WordCaption target={target} />
          </motion.div>
        )}
      </div>
      {phase === 'done' && <Stars />}
    </GameArea>
  );
}
