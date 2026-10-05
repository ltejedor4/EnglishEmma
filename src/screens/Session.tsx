import { useEffect, useMemo, useRef, useState } from 'react';
import { Buddy } from '../components/Buddy.tsx';
import { GameArea, Screen } from '../components/Screen.tsx';
import { ListenTouch } from '../games/ListenTouch.tsx';
import type { RoundResult } from '../games/ListenTouch.tsx';
import { Balloons } from '../games/Balloons.tsx';
import { FeedBuddy } from '../games/FeedBuddy.tsx';
import { Memory } from '../games/Memory.tsx';
import { Presentation } from '../games/Presentation.tsx';
import { preload, say } from '../lib/audio.ts';
import { keyOf } from '../lib/review.ts';
import { audioKeys, buildSteps } from '../lib/session.ts';
import type { Step } from '../lib/session.ts';
import type { LessonMode } from '../lib/lesson.ts';
import type { SessionPlan, WordProgress } from '../lib/review.ts';

interface Props {
  plan: SessionPlan;
  progress: WordProgress;
  mode?: LessonMode;
  /** Cambia cada noche: decide qué juegos tocan hoy. */
  seed?: number;
  /** Práctica libre: un solo juego. */
  practice?: boolean;
  /** Por palabra: true si la acertó a la primera en todas sus rondas. */
  onFinish: (results: Record<string, boolean>) => void;
}

export function Session({ plan, progress, mode = 'mix', seed = 0, practice = false, onFinish }: Props) {
  const steps = useMemo(
    () => buildSteps(plan, progress, { mode, seed, practice }),
    [plan, progress, mode, seed, practice],
  );
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
      {step.kind === 'memory' && <Memory key={index} words={step.words} onDone={answered} />}
      {step.kind === 'balloons' && <Balloons key={index} rounds={step.rounds} onDone={answered} />}
      {step.kind === 'feed' && <FeedBuddy key={index} rounds={step.rounds} onDone={answered} />}
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
