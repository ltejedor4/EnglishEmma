import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Buddy } from '../components/Buddy.tsx';
import { GameArea } from '../components/Screen.tsx';
import { SpeakerButton } from '../components/SpeakerButton.tsx';
import { Stars } from '../components/Stars.tsx';
import { WordCaption, WordImage } from '../components/WordImage.tsx';
import { randomCelebration, say } from '../lib/audio.ts';
import { image } from '../lib/images.ts';
import { keyOf } from '../lib/review.ts';
import type { WordRef } from '../lib/review.ts';
import type { RoundResult } from './ListenTouch.tsx';

export interface BalloonRound {
  target: WordRef;
  options: WordRef[];
}

const clipOf = (ref: WordRef) => `${ref.topicId}/${ref.word.id}`;
/** Colores de globo para los temas que no son colores (el globo lleva la tarjeta colgando). */
const SPARE_COLORS = ['red', 'blue', 'yellow', 'green', 'pink', 'orange'];

/** Pop the Balloons: suben globos y Buddy dice cuál reventar ("Pop… red!"). Si se escapa, vuelve a subir. */
export function Balloons({ rounds, onDone }: { rounds: BalloonRound[]; onDone: (results: RoundResult[]) => void }) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const round = rounds[index];
  const prompt = useMemo(() => ['common/pop', clipOf(round.target)], [round]);

  useEffect(() => {
    say(...(index === 0 ? ['common/pop-the-balloons'] : []), ...prompt);
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
      <BalloonRoundView key={index} round={round} prompt={prompt} onDone={finishRound} />
    </GameArea>
  );
}

function BalloonRoundView({
  round,
  prompt,
  onDone,
}: {
  round: BalloonRound;
  prompt: string[];
  onDone: (firstTry: boolean) => void;
}) {
  const [popped, setPopped] = useState(false);
  const [missed, setMissed] = useState(false);
  const [wobble, setWobble] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Cada globo con su velocidad y su retraso, para que no suban en fila.
  const lanes = useMemo(
    () => round.options.map((_, i) => ({ duration: 7 + ((i * 1.7) % 3), delay: (i * 1.3) % 3.5 })),
    [round],
  );

  async function pop(ref: WordRef) {
    if (busy || popped) return;
    if (keyOf(ref) === keyOf(round.target)) {
      setPopped(true);
      if (await say(clipOf(ref), randomCelebration())) onDone(!missed);
      return;
    }
    setMissed(true);
    setWobble(keyOf(ref));
    setBusy(true);
    // En los globos sí ayuda resaltar el correcto (se mueven y es difícil seguirlos).
    await say('common/try-again');
    setBusy(false);
    setWobble(null);
  }

  return (
    <div className="relative size-full overflow-hidden" data-balloons={prompt.join(' ')}>
      <div className="absolute top-2 left-1/2 -translate-x-1/2">
        <Buddy pose={popped ? 'cheer' : missed ? 'point' : 'listen'} size={90} />
      </div>
      <div className="absolute inset-x-0 top-[110px] bottom-0 flex justify-around px-2">
        {round.options.map((ref, i) => {
          const key = keyOf(ref);
          const isTarget = key === keyOf(round.target);
          const color = ref.topicId === 'colors' ? ref.word.id : SPARE_COLORS[(i + 2) % SPARE_COLORS.length];
          const balloon = image(`balloon-${color}`);
          return (
            <div key={key} className="relative h-full w-[min(22vw,170px)]">
              <AnimatePresence>
                {!(popped && isTarget) && (
                  // El botón sube en bucle; adentro, el bamboleo de "este no es" no interrumpe la subida.
                  <motion.button
                    className="absolute inset-x-0"
                    initial={{ top: '100%' }}
                    animate={{ top: ['100%', '-60%'] }}
                    exit={{ scale: 1.6, opacity: 0, transition: { duration: 0.35 } }}
                    transition={{ top: { duration: lanes[i].duration, delay: lanes[i].delay, repeat: Infinity, ease: 'linear' } }}
                    onClick={() => pop(ref)}
                    data-balloon={key}
                  >
                    <motion.div
                      className="flex w-full flex-col items-center"
                      animate={wobble === key ? { rotate: [0, -12, 12, -8, 8, 0] } : { rotate: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className={`w-full ${missed && isTarget ? 'drop-shadow-[0_0_18px_rgb(255_233_168)]' : ''}`}>
                        {balloon ? (
                          <img src={balloon} alt="" draggable={false} className="pointer-events-none w-full" />
                        ) : (
                          <span className="text-[min(18vw,130px)] leading-none">🎈</span>
                        )}
                      </div>
                      {ref.topicId === 'colors' ? (
                        <span className="mt-1 rounded-full bg-cream/90 px-3 py-0.5 text-[min(4vw,22px)] font-bold text-night">
                          {ref.word.say.replace(/[.!?]$/, '')}
                        </span>
                      ) : (
                        <div
                          className="relative -mt-[12%] grid size-(--size) place-items-center rounded-2xl bg-cream pb-[14%] text-[calc(var(--size)*0.6)] leading-none shadow-md"
                          style={{ ['--size' as string]: 'min(16vw, 110px)' }}
                        >
                          <WordImage target={ref} />
                          <WordCaption target={ref} />
                        </div>
                      )}
                    </motion.div>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      {popped && <Stars />}
    </div>
  );
}
