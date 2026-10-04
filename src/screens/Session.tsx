import { useEffect, useMemo, useRef, useState } from 'react';
import { topics } from '../content/index.ts';
import { Buddy } from '../components/Buddy.tsx';
import { GameArea, Screen } from '../components/Screen.tsx';
import type { Pose } from '../components/Buddy.tsx';
import { ListenTouch } from '../games/ListenTouch.tsx';
import type { RoundResult } from '../games/ListenTouch.tsx';
import { Presentation } from '../games/Presentation.tsx';
import { preload, say } from '../lib/audio.ts';
import { factsNaming, keyOf, pickOptions, shuffle } from '../lib/review.ts';
import type { LessonMode } from '../lib/lesson.ts';
import type { SessionPlan, WordProgress, WordRef } from '../lib/review.ts';

type Step =
  | { kind: 'say'; keys: string[]; pose: Pose }
  | { kind: 'present'; target: WordRef }
  | { kind: 'touch'; targets: WordRef[]; options: WordRef[]; prompt: string[] };

/** Rondas de Listen & Touch mínimas por sesión: si hay pocas palabras, se juega más con las mismas. */
const MIN_ROUNDS = 8;

const topicOf = (ref: WordRef) => topics.find((t) => t.id === ref.topicId)!;
const clipOf = (ref: WordRef) => `${ref.topicId}/${ref.word.id}`;

/**
 * Repaso → palabras nuevas → rondas extra hasta MIN_ROUNDS. Las rondas mezclan tres formas de preguntar:
 * - ask:  "Where is the dog?" / "Find the red one!"
 * - fact: una frase que la nombra, "The sky is blue." → encontrar el azul (comprensión en contexto)
 * - pair: "Find these two! red… and… blue" → tocar las dos
 * Con un modo distinto de "mix" (elegido en la zona de padres), todas las rondas usan esa forma.
 */
function buildSteps(plan: SessionPlan, progress: WordProgress, mode: LessonMode): Step[] {
  const steps: Step[] = [{ kind: 'say', keys: ['common/hello-emma', 'common/lets-play'], pose: 'hello' }];
  // Palabras que ya vio: preferidas como distractores. Las nuevas cuentan recién después de presentarlas.
  const known = new Set(Object.keys(progress));
  const box = (ref: WordRef) => progress[keyOf(ref)]?.box ?? 0;
  // Más opciones cuanto mejor la sabe: caja 0 → 2, caja 1 → 3, caja 2+ → 4.
  const countFor = (ref: WordRef) => 2 + Math.min(box(ref), 2);

  const ask = (target: WordRef, count: number): Extract<Step, { kind: 'touch' }> => ({
    kind: 'touch',
    targets: [target],
    options: pickOptions(target, topicOf(target), count, known),
    prompt: [`${clipOf(target)}-ask`],
  });
  const fact = (target: WordRef, count: number): Step => {
    const facts = factsNaming(target.word, topicOf(target));
    if (!facts.length) return ask(target, count);
    const n = facts[Math.floor(Math.random() * facts.length)];
    return { ...ask(target, count), prompt: [`${clipOf(target)}-fact-${n}`] };
  };
  const pair = (a: WordRef, b: WordRef): Step => ({
    kind: 'touch',
    targets: [a, b],
    options: pickOptions([a, b], topicOf(a), 4, known),
    prompt: ['common/find-these-two', clipOf(a), 'common/and', clipOf(b)],
  });
  const rounds = () => steps.filter((s) => s.kind === 'touch').length;
  // Una sola palabra: según el modo, o alternando pregunta directa y frase.
  const single = (target: WordRef, count: number, variant: number): Step =>
    mode === 'ask' || (mode !== 'fact' && variant % 2 === 0) ? ask(target, count) : fact(target, count);
  const canPair = (a: WordRef, b: WordRef | undefined): b is WordRef => !!b && a.topicId === b.topicId;

  if (plan.review.length) {
    steps.push({ kind: 'say', keys: ['common/lets-review'], pose: 'hello' });
    const order = shuffle(plan.review);
    for (let i = 0, variant = 0; i < order.length; variant++) {
      const [a, b] = [order[i], order[i + 1]];
      // Las que ya sabe (caja 1+) y son del mismo tema pueden ir de a dos.
      if (canPair(a, b) && (mode === 'pair' || (mode === 'mix' && variant % 3 === 0 && box(a) >= 1 && box(b) >= 1))) {
        steps.push(pair(a, b));
        i += 2;
      } else {
        steps.push(single(a, countFor(a), variant));
        i += 1;
      }
    }
  }

  if (plan.fresh.length) {
    steps.push({ kind: 'say', keys: ['common/new-words'], pose: 'cheer' });
    for (const target of plan.fresh) {
      steps.push({ kind: 'present', target });
      known.add(keyOf(target));
    }
    steps.push({ kind: 'say', keys: ['common/lets-play-a-game'], pose: 'hello' });
    // Primero la pregunta directa con 2 opciones (para conocerlas); después, en el modo elegido con 3.
    let last: WordRef | undefined;
    for (const [round, count] of [2, 3].entries()) {
      let order = shuffle(plan.fresh);
      if (order.length > 1 && order[0] === last) order = [...order.slice(1), order[0]];
      for (let i = 0; i < order.length; i++) {
        const [a, b] = [order[i], order[i + 1]];
        if (round === 0) steps.push(ask(a, count));
        else if (mode === 'pair' && canPair(a, b)) {
          steps.push(pair(a, b));
          i++;
        } else steps.push(mode === 'ask' ? ask(a, count) : fact(a, count));
      }
      last = order.at(-1);
    }
  }

  // Rondas extra con todo lo que ya vio, para que la sesión no se quede corta.
  const pool = [...plan.review, ...plan.fresh];
  if (pool.length && rounds() < MIN_ROUNDS) {
    steps.push({ kind: 'say', keys: ['common/lets-play-a-game'], pose: 'cheer' });
    let last: WordRef | undefined;
    for (let variant = 0; rounds() < MIN_ROUNDS; variant++) {
      let order = shuffle(pool);
      if (order.length > 1 && order[0] === last) order = [...order.slice(1), order[0]];
      for (let i = 0; i < order.length && rounds() < MIN_ROUNDS; i++, variant++) {
        const [a, b] = [order[i], order[i + 1]];
        if (canPair(a, b) && (mode === 'pair' || (mode === 'mix' && variant % 3 === 1))) {
          steps.push(pair(a, b));
          i++;
        } else {
          steps.push(single(a, Math.max(3, countFor(a)), variant));
        }
      }
      last = order.at(-1);
    }
  }
  return steps;
}

function audioKeys(steps: Step[]): string[] {
  return steps.flatMap((step) => {
    if (step.kind === 'say') return step.keys;
    if (step.kind === 'present') return [clipOf(step.target), `${clipOf(step.target)}-fact-1`];
    return [...step.prompt, ...step.targets.map(clipOf)];
  });
}

interface Props {
  plan: SessionPlan;
  progress: WordProgress;
  mode?: LessonMode;
  /** Por palabra: true si la acertó a la primera en todas sus rondas. */
  onFinish: (results: Record<string, boolean>) => void;
}

export function Session({ plan, progress, mode = 'mix', onFinish }: Props) {
  const steps = useMemo(() => buildSteps(plan, progress, mode), [plan, progress, mode]);
  const [index, setIndex] = useState(0);
  const results = useRef<Record<string, boolean>>({});

  useEffect(() => {
    preload([...audioKeys(steps), 'common/look-here-it-is']);
  }, [steps]);

  function next() {
    if (index + 1 >= steps.length) onFinish(results.current);
    else setIndex(index + 1);
  }

  function answered(round: RoundResult[]) {
    for (const { target, firstTry } of round) {
      const key = keyOf(target);
      results.current[key] = (results.current[key] ?? true) && firstTry;
    }
    next();
  }

  const step = steps[index];
  return (
    <Screen>
      <div data-step={index} hidden />
      <div className="absolute top-4 left-1/2 h-3.5 w-[min(50vw,400px)] -translate-x-1/2 overflow-hidden rounded-full bg-white/12" aria-hidden>
        <div className="h-full rounded-full bg-moon transition-[width] duration-500" style={{ width: `${(index / steps.length) * 100}%` }} />
      </div>
      {step.kind === 'say' && <SayStep key={index} step={step} onDone={next} />}
      {step.kind === 'present' && <Presentation key={index} target={step.target} onDone={next} />}
      {step.kind === 'touch' && (
        <ListenTouch key={index} targets={step.targets} options={step.options} prompt={step.prompt} onDone={answered} />
      )}
    </Screen>
  );
}

function SayStep({ step, onDone }: { step: Extract<Step, { kind: 'say' }>; onDone: () => void }) {
  // onDone cambia en cada render de Session; el audio solo debe arrancar al aparecer el paso.
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });
  useEffect(() => {
    let alive = true;
    say(...step.keys).then((finished) => finished && alive && onDoneRef.current());
    return () => {
      alive = false;
    };
  }, [step.keys]);
  return (
    <GameArea>
      <Buddy pose={step.pose} size={220} />
    </GameArea>
  );
}
