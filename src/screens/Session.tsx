import { useEffect, useMemo, useRef, useState } from 'react';
import { Buddy } from '../components/Buddy.tsx';
import { GameArea, Screen } from '../components/Screen.tsx';
import { ListenTouch } from '../games/ListenTouch.tsx';
import type { RoundResult } from '../games/ListenTouch.tsx';
import { Balloons } from '../games/Balloons.tsx';
import { FeedBuddy } from '../games/FeedBuddy.tsx';
import { Memory } from '../games/Memory.tsx';
import { Presentation } from '../games/Presentation.tsx';
import { SayIt } from '../games/SayIt.tsx';
import type { SpeechMode } from '../lib/speech.ts';
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
  /** Modo de "Your turn! Say it!" (zona de padres); 'off' no lo incluye. */
  speech?: SpeechMode;
  onSpeechIssue?: (reason: string) => void;
  /** Por palabra: true si la acertó a la primera en todas sus rondas; y las que dijo bien en voz alta. */
  onFinish: (results: Record<string, boolean>, spoken: string[]) => void;
}

export function Session({ plan, progress, mode = 'mix', seed = 0, practice = false, speech = 'auto', onSpeechIssue, onFinish }: Props) {
  const speak = speech !== 'off';
  const steps = useMemo(
    () => buildSteps(plan, progress, { mode, seed, practice, speak }),
    [plan, progress, mode, seed, practice, speak],
  );
  const [index, setIndex] = useState(0);
  const results = useRef<Record<string, boolean>>({});
  const spoken = useRef<string[]>([]);

  useEffect(() => {
    preload([...audioKeys(steps), 'common/try-again']);
  }, [steps]);

  function next() {
    if (index + 1 >= steps.length) onFinish(results.current, spoken.current);
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
      {step.kind === 'speak' && (
        <SayIt
          key={index}
          targets={step.targets}
          questions={step.questions}
          mode={speech}
          onIssue={onSpeechIssue}
          onDone={(said) => {
            spoken.current.push(...said);
            next();
          }}
        />
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
