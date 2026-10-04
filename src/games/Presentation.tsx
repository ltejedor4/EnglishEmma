import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { cardClass, cardSize } from '../components/cardStyles.ts';
import { NextButton } from '../components/NextButton.tsx';
import { GameArea } from '../components/Screen.tsx';
import { WordImage } from '../components/WordImage.tsx';
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
    <GameArea>
      <motion.button
        className={`${cardClass} pb-[12%]`}
        style={cardSize('min(70vw, 55vh, 380px)')}
        initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        onClick={() => say(base)}
      >
        <WordImage target={target} />
        <span className="absolute bottom-[6%] text-[calc(var(--size)*0.12)] font-bold text-night">{target.word.say.replace(/\.$/, '')}</span>
      </motion.button>
      {ready && <NextButton onClick={onDone} />}
    </GameArea>
  );
}
