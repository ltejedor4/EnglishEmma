import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { NextButton } from '../components/NextButton.tsx';
import { say } from '../lib/audio.ts';
import type { WordRef } from '../lib/review.ts';

/** Presenta una palabra nueva: imagen grande, la palabra y una frase. Tocar la imagen la repite. */
export function Presentation({ target, onDone }: { target: WordRef; onDone: () => void }) {
  const base = `${target.topicId}/${target.word.id}`;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    say(base, `${base}-fact-1`).then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [base]);

  return (
    <div className="game">
      <motion.button
        className="card big"
        initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        onClick={() => say(base)}
      >
        {target.word.image}
        <span className="caption">{target.word.say.replace(/\.$/, '')}</span>
      </motion.button>
      {ready && <NextButton onClick={onDone} />}
    </div>
  );
}
