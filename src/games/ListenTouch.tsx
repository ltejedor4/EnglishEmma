import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Buddy } from '../components/Buddy.tsx';
import { SpeakerButton } from '../components/SpeakerButton.tsx';
import { Stars } from '../components/Stars.tsx';
import { randomCelebration, say } from '../lib/audio.ts';
import type { WordRef } from '../lib/review.ts';

interface Props {
  target: WordRef;
  options: WordRef[];
  /** firstTry = acertó sin equivocarse. */
  onDone: (firstTry: boolean) => void;
}

/** Buddy pregunta "Where is the dog?" y Emma toca la imagen. Un error no castiga: Buddy muestra la correcta. */
export function ListenTouch({ target, options, onDone }: Props) {
  const ask = `${target.topicId}/${target.word.id}-ask`;
  const [missed, setMissed] = useState(false);
  const [shaking, setShaking] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    say(ask);
  }, [ask]);

  async function touch(ref: WordRef) {
    if (busy || solved) return;
    if (ref.word.id === target.word.id) {
      setSolved(true);
      if (await say(randomCelebration())) onDone(!missed);
      return;
    }
    setMissed(true);
    setShaking(ref.word.id);
    setBusy(true);
    await say('common/look-here-it-is', `${target.topicId}/${target.word.id}`);
    setBusy(false);
    setShaking(null);
  }

  return (
    <div className="game">
      <SpeakerButton onClick={() => !solved && say(ask)} />
      <Buddy pose={solved ? 'cheer' : missed ? 'point' : 'listen'} size={110} />
      <div className="options">
        {options.map((ref) => {
          const correct = ref.word.id === target.word.id;
          return (
            <motion.button
              key={ref.word.id}
              className={`card ${missed && correct && !solved ? 'hint' : ''} ${solved && correct ? 'right' : ''}`}
              animate={
                shaking === ref.word.id
                  ? { x: [0, -14, 14, -10, 10, 0] }
                  : { scale: solved ? (correct ? 1.12 : 0.85) : 1, opacity: solved && !correct ? 0.4 : 1 }
              }
              transition={{ duration: 0.45 }}
              onClick={() => touch(ref)}
            >
              {ref.word.image}
            </motion.button>
          );
        })}
      </div>
      {solved && <Stars />}
    </div>
  );
}
