import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Buddy } from '../components/Buddy.tsx';
import { cardClass, cardSize } from '../components/cardStyles.ts';
import { GameArea } from '../components/Screen.tsx';
import { SpeakerButton } from '../components/SpeakerButton.tsx';
import { Stars } from '../components/Stars.tsx';
import { WordCaption, WordImage } from '../components/WordImage.tsx';
import { topics } from '../content/index.ts';
import type { QuestionRef } from '../content/index.ts';
import { randomCelebration, say, stopAll } from '../lib/audio.ts';
import { image } from '../lib/images.ts';
import { keyOf } from '../lib/review.ts';
import type { WordRef } from '../lib/review.ts';
import { canRecognize, canRecord, FATAL_ERRORS, listenOnce, playClip, recordClip } from '../lib/speech.ts';
import type { SpeechMode } from '../lib/speech.ts';
import { matchAnswer, matchSpoken } from '../lib/speechMatch.ts';

const clipOf = (ref: WordRef) => `${ref.topicId}/${ref.word.id}`;
const topicsById = Object.fromEntries(topics.map((t) => [t.id, t]));

/** Algo que Emma tiene que decir: una palabra ("Dog.") o la respuesta a una pregunta ("How old are you?"). */
interface SpeakItem {
  /** Clave para el progreso ("animals/dog", "hello/q-age"). */
  key: string;
  card: ReactNode;
  /** Lo que dice Buddy antes del 🎤. */
  prompt: string[];
  /** Tras no entenderle: otra oportunidad, con el modelo de lo que tiene que decir. */
  retry: string[];
  matches: (alternatives: string[]) => boolean;
}

function wordItem(ref: WordRef): SpeakItem {
  return {
    key: keyOf(ref),
    card: (
      <>
        <WordImage target={ref} />
        <WordCaption target={ref} />
      </>
    ),
    prompt: ['common/your-turn', clipOf(ref)],
    retry: ['common/try-again', clipOf(ref)],
    matches: (alternatives) => matchSpoken(ref.word, alternatives),
  };
}

function questionItem({ topicId, question }: QuestionRef): SpeakItem {
  const src = image(question.imageName ?? `q-${topicId}-${question.id}`);
  const base = `${topicId}/q-${question.id}`;
  return {
    key: base,
    card: (
      <>
        {src ? (
          <img src={src} alt="" draggable={false} className="pointer-events-none size-[78%] object-contain" />
        ) : (
          question.image
        )}
        <span className="absolute bottom-[5%] px-2 text-center text-[calc(var(--size)*0.085)] leading-tight font-bold text-night">
          {question.ask}
        </span>
      </>
    ),
    prompt: [`${base}-ask`],
    // "My name is Emma. Your turn! Say it!": aprende la frase completa sin sentir que se equivocó.
    retry: [`${base}-answer`, 'common/your-turn'],
    matches: (alternatives) => matchAnswer(question, alternatives, topicsById),
  };
}

/** Cómo funciona de verdad en este dispositivo: el modo pedido, o el respaldo que se pueda. */
type Effective = 'auto' | 'record' | 'repeat';
const effectiveMode = (mode: SpeechMode): Effective =>
  mode === 'auto' && canRecognize() ? 'auto' : canRecord() ? 'record' : 'repeat';

type Phase = 'prompt' | 'ready' | 'listening' | 'recording' | 'playback' | 'confirm' | 'done';

interface Props {
  targets: WordRef[];
  questions?: QuestionRef[];
  mode: SpeechMode;
  /** Lo que dijo bien (solo cuenta el modo automático, que de verdad la escuchó). */
  onDone: (spoken: string[]) => void;
  /** El micrófono o el reconocimiento no funcionan aquí (para avisar en la zona de padres). */
  onIssue?: (reason: string) => void;
}

/**
 * "Your turn! Say it!": Emma dice palabras y responde preguntas en voz alta.
 * Muy generoso y nunca castiga: dos intentos y, si no se entendió, "Great try!" y sigue.
 */
export function SayIt({ targets, questions = [], mode, onDone, onIssue }: Props) {
  const items = useMemo(() => [...targets.map(wordItem), ...questions.map(questionItem)], [targets, questions]);
  const [index, setIndex] = useState(0);
  const [spoken, setSpoken] = useState<string[]>([]);
  const [effective, setEffective] = useState<Effective>(() => effectiveMode(mode));
  const item = items[index];

  function next(said: boolean) {
    const all = said ? [...spoken, item.key] : spoken;
    if (index + 1 < items.length) {
      setSpoken(all);
      setIndex(index + 1);
    } else onDone(all);
  }

  /** Algo falló de forma permanente: avisar y seguir con el respaldo que haya. */
  function fallback(reason: string) {
    onIssue?.(reason);
    setEffective(effective === 'auto' && canRecord() && reason !== 'not-allowed' ? 'record' : 'repeat');
  }

  return (
    <GameArea>
      <SayItem key={`${index}-${effective}`} item={item} first={index === 0} effective={effective} onNext={next} onFallback={fallback} />
    </GameArea>
  );
}

function SayItem({
  item,
  first,
  effective,
  onNext,
  onFallback,
}: {
  item: SpeakItem;
  first: boolean;
  effective: Effective;
  onNext: (said: boolean) => void;
  onFallback: (reason: string) => void;
}) {
  const [phase, setPhase] = useState<Phase>('prompt');
  const [attempt, setAttempt] = useState(0);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let alive = true;
    say(...(first ? ['common/lets-talk'] : []), ...item.prompt).then(() => alive && setPhase(effective === 'repeat' ? 'confirm' : 'ready'));
    return () => {
      alive = false;
    };
  }, [first, item, effective]);

  async function celebrate(said: boolean, line = randomCelebration()) {
    setSuccess(said);
    setPhase('done');
    await say(line);
    onNext(said);
  }

  async function tapMic() {
    if (phase !== 'ready') return;
    stopAll();
    if (effective === 'auto') {
      setPhase('listening');
      const result = await listenOnce(6000);
      if ('error' in result && FATAL_ERRORS.includes(result.error)) return onFallback(result.error);
      // Cualquier otro error (no habló, se cortó) cuenta como "no se entendió".
      const alternatives = 'alternatives' in result ? result.alternatives : [];
      if (item.matches(alternatives)) return celebrate(true, 'common/well-said');
      if (attempt === 0) {
        setAttempt(1);
        setPhase('prompt');
        await say(...item.retry);
        setPhase('ready');
        return;
      }
      return celebrate(false, 'common/great-try');
    }
    // Grabar y escucharse
    setPhase('recording');
    const result = await recordClip(3500);
    if ('error' in result) return onFallback(result.error);
    setPhase('playback');
    await say('common/listen-to-you');
    await playClip(result.blob);
    setPhase('confirm');
  }

  const mic = image('mic-button');
  const listening = phase === 'listening' || phase === 'recording';
  return (
    <div className="flex size-full flex-col items-center justify-center gap-5" data-say={item.key} data-phase={phase}>
      <SpeakerButton onClick={() => !listening && say(...item.prompt)} />
      <Buddy pose={phase === 'done' ? 'cheer' : listening ? 'listen' : 'talk'} size={110} />
      <div className={`${cardClass} pb-[14%]`} style={cardSize('min(44vw, 34vh, 280px)')}>
        {item.card}
      </div>
      <div className="grid h-36 place-items-center">
        {(phase === 'ready' || listening) && (
          <motion.button
            className="relative grid size-32 place-items-center rounded-full bg-moon text-6xl text-night"
            animate={listening ? { scale: 1 } : { scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            onClick={tapMic}
            aria-label="Micrófono"
            data-mic
          >
            {listening &&
              [0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="absolute inset-0 rounded-full border-4 border-moon"
                  initial={{ scale: 1, opacity: 0.7 }}
                  animate={{ scale: 1.9, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.5 }}
                />
              ))}
            {mic ? <img src={mic} alt="" className="size-20" draggable={false} /> : '🎤'}
          </motion.button>
        )}
        {phase === 'playback' && <span className="text-6xl">👂</span>}
        {phase === 'confirm' && (
          <motion.button
            className="grid size-32 place-items-center rounded-full bg-success text-6xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => celebrate(false)}
            aria-label="Listo"
            data-confirm
          >
            ✅
          </motion.button>
        )}
      </div>
      {phase === 'done' && success && <Stars />}
    </div>
  );
}
