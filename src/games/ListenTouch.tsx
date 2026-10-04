import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Buddy } from '../components/Buddy.tsx';
import { cardClass, cardHintClass, cardSize } from '../components/cardStyles.ts';
import { GameArea } from '../components/Screen.tsx';
import { SpeakerButton } from '../components/SpeakerButton.tsx';
import { Stars } from '../components/Stars.tsx';
import { WordCaption, WordImage } from '../components/WordImage.tsx';
import { randomCelebration, say } from '../lib/audio.ts';
import { keyOf } from '../lib/review.ts';
import type { WordRef } from '../lib/review.ts';

export interface RoundResult {
  target: WordRef;
  /** Acertó sin equivocarse. */
  firstTry: boolean;
}

interface Props {
  /** Una palabra ("Where is the dog?") o dos ("Find these two! red… and… blue"). */
  targets: WordRef[];
  options: WordRef[];
  /** Clips que forman la pregunta, p. ej. ['colors/blue-fact-1'] = "The sky is blue." */
  prompt: string[];
  onDone: (results: RoundResult[]) => void;
}

const clipOf = (ref: WordRef) => `${ref.topicId}/${ref.word.id}`;

/** Buddy pide algo y Emma toca la imagen. Un error no castiga: Buddy muestra la correcta. */
export function ListenTouch({ targets, options, prompt, onDone }: Props) {
  const [found, setFound] = useState<string[]>([]);
  // Palabras que estaban pendientes cuando se equivocó: no cuentan como acierto a la primera.
  const [missed, setMissed] = useState<string[]>([]);
  const [shaking, setShaking] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isTarget = (ref: WordRef) => targets.some((t) => keyOf(t) === keyOf(ref));
  const pending = targets.filter((t) => !found.includes(keyOf(t)));
  const solved = pending.length === 0;

  const promptKey = prompt.join('|');
  useEffect(() => {
    say(...promptKey.split('|'));
  }, [promptKey]);

  async function touch(ref: WordRef) {
    const key = keyOf(ref);
    if (busy || solved || found.includes(key)) return;
    if (isTarget(ref)) {
      const nowFound = [...found, key];
      setFound(nowFound);
      if (nowFound.length < targets.length) {
        say(clipOf(ref)); // Confirma la primera: "Red!"
        return;
      }
      if (await say(randomCelebration())) {
        onDone(targets.map((target) => ({ target, firstTry: !missed.includes(keyOf(target)) })));
      }
      return;
    }
    setMissed([...missed, ...pending.map(keyOf)]);
    setShaking(key);
    setBusy(true);
    await say('common/look-here-it-is', ...pending.map(clipOf));
    setBusy(false);
    setShaking(null);
  }

  return (
    <GameArea>
      <SpeakerButton onClick={() => !solved && say(...prompt)} />
      <Buddy pose={solved ? 'cheer' : missed.length ? 'point' : 'listen'} size={110} />
      <div className="flex max-w-full flex-wrap justify-center gap-6" data-options={prompt.join(' ')}>
        {options.map((ref) => {
          const key = keyOf(ref);
          const right = found.includes(key);
          const hint = missed.length > 0 && isTarget(ref) && !right;
          return (
            <motion.button
              key={key}
              className={`${cardClass} pb-[14%] ${hint ? cardHintClass : ''} ${right ? 'border-success' : ''}`}
              style={cardSize(options.length > 4 ? 'min(24vw, 32vh, 200px)' : 'min(30vw, 36vh, 240px)')}
              data-card={right ? 'right' : ''}
              animate={
                shaking === key
                  ? { x: [0, -14, 14, -10, 10, 0] }
                  : { scale: right ? 1.08 : solved ? 0.85 : 1, opacity: solved && !right ? 0.4 : 1 }
              }
              transition={{ duration: 0.45 }}
              onClick={() => touch(ref)}
            >
              <WordImage target={ref} />
              <WordCaption target={ref} />
            </motion.button>
          );
        })}
      </div>
      {solved && <Stars />}
    </GameArea>
  );
}
