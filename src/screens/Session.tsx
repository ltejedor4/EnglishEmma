import { useEffect, useMemo, useRef, useState } from 'react';
import { topics } from '../content/index.ts';
import { Buddy } from '../components/Buddy.tsx';
import type { Pose } from '../components/Buddy.tsx';
import { ListenTouch } from '../games/ListenTouch.tsx';
import { Presentation } from '../games/Presentation.tsx';
import { preload, say } from '../lib/audio.ts';
import { keyOf, pickOptions, shuffle } from '../lib/review.ts';
import type { SessionPlan, WordProgress, WordRef } from '../lib/review.ts';

type Step =
  | { kind: 'say'; keys: string[]; pose: Pose }
  | { kind: 'present'; target: WordRef }
  | { kind: 'touch'; target: WordRef; options: WordRef[] };

const topicOf = (ref: WordRef) => topics.find((t) => t.id === ref.topicId)!;

/** Repaso → palabras nuevas (presentación + dos rondas de Listen & Touch, 2 y luego 3 opciones). */
function buildSteps(plan: SessionPlan, progress: WordProgress): Step[] {
  const steps: Step[] = [{ kind: 'say', keys: ['common/hello-emma', 'common/lets-play'], pose: 'hello' }];
  // Palabras que ya vio (antes o en esta sesión): preferidas como distractores.
  const known = new Set([...Object.keys(progress), ...plan.fresh.map(keyOf)]);
  const touch = (target: WordRef, count: number): Step => ({
    kind: 'touch',
    target,
    options: pickOptions(target, topicOf(target), count, known),
  });

  if (plan.review.length) {
    steps.push({ kind: 'say', keys: ['common/lets-review'], pose: 'hello' });
    for (const target of shuffle(plan.review)) {
      // Más opciones cuanto mejor la sabe: caja 0 → 2, caja 1 → 3, caja 2+ → 4.
      steps.push(touch(target, 2 + Math.min(progress[keyOf(target)]?.box ?? 0, 2)));
    }
  }

  if (plan.fresh.length) {
    steps.push({ kind: 'say', keys: ['common/new-words'], pose: 'cheer' });
    for (const target of plan.fresh) steps.push({ kind: 'present', target });
    steps.push({ kind: 'say', keys: ['common/lets-play-a-game'], pose: 'hello' });
    let last: WordRef | undefined;
    for (const count of [2, 3]) {
      let order = shuffle(plan.fresh);
      // Que la primera de una ronda no sea la misma que la última de la anterior.
      if (order.length > 1 && order[0] === last) order = [...order.slice(1), order[0]];
      for (const target of order) steps.push(touch(target, count));
      last = order.at(-1);
    }
  }
  return steps;
}

function audioKeys(steps: Step[]): string[] {
  return steps.flatMap((step) => {
    if (step.kind === 'say') return step.keys;
    const base = `${step.target.topicId}/${step.target.word.id}`;
    return step.kind === 'present' ? [base, `${base}-fact-1`] : [`${base}-ask`, base];
  });
}

interface Props {
  plan: SessionPlan;
  progress: WordProgress;
  /** Por palabra: true si la acertó a la primera en todas sus rondas. */
  onFinish: (results: Record<string, boolean>) => void;
}

export function Session({ plan, progress, onFinish }: Props) {
  const steps = useMemo(() => buildSteps(plan, progress), [plan, progress]);
  const [index, setIndex] = useState(0);
  const results = useRef<Record<string, boolean>>({});

  useEffect(() => {
    preload([...audioKeys(steps), 'common/look-here-it-is']);
  }, [steps]);

  function next() {
    if (index + 1 >= steps.length) onFinish(results.current);
    else setIndex(index + 1);
  }

  function answered(target: WordRef, firstTry: boolean) {
    const key = keyOf(target);
    results.current[key] = (results.current[key] ?? true) && firstTry;
    next();
  }

  const step = steps[index];
  return (
    <main className="screen">
      <div className="progress" aria-hidden>
        <div style={{ width: `${(index / steps.length) * 100}%` }} />
      </div>
      {step.kind === 'say' && <SayStep key={index} step={step} onDone={next} />}
      {step.kind === 'present' && <Presentation key={index} target={step.target} onDone={next} />}
      {step.kind === 'touch' && (
        <ListenTouch
          key={index}
          target={step.target}
          options={step.options}
          onDone={(firstTry) => answered(step.target, firstTry)}
        />
      )}
    </main>
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
    <div className="game">
      <Buddy pose={step.pose} size={220} />
    </div>
  );
}
