import { useState } from 'react';
import { topics } from './content/index.ts';
import type { Topic } from './content/types.ts';
import type { LessonMode } from './lib/lesson.ts';
import { loadProgress, saveProgress } from './lib/progress.ts';
import { doingWell, planSession, planTopicSession, recordResult, today } from './lib/review.ts';
import type { SessionPlan } from './lib/review.ts';
import { GoodNight } from './screens/GoodNight.tsx';
import { Home } from './screens/Home.tsx';
import { ParentGate } from './screens/ParentGate.tsx';
import { ParentZone } from './screens/ParentZone.tsx';
import type { LessonChoice } from './screens/ParentZone.tsx';
import { PUZZLE_PIECES, PuzzleScreen } from './screens/PuzzleScreen.tsx';
import { Session } from './screens/Session.tsx';

type Screen =
  | { name: 'home' }
  | { name: 'gate' }
  | { name: 'parents' }
  | { name: 'session'; plan: SessionPlan; mode: LessonMode }
  | { name: 'puzzle'; topic: Topic; placedBefore: number }
  | { name: 'night' };

export default function App() {
  const [progress, setProgress] = useState(loadProgress);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const day = today();
  const playedToday = progress.sessionDays.includes(day);

  /** La lección automática. Después de la de la noche se puede seguir practicando: si va bien, también
   *  con palabras nuevas (hasta el tope diario); si le está costando, solo repaso. */
  function todaysPlan() {
    const options = playedToday ? { maxReview: 6, maxNew: doingWell(progress.words) ? 3 : 0 } : undefined;
    return planSession(topics, progress.words, day, options);
  }

  /** Lección elegida en la zona de padres: la de hoy o un tema concreto, con el tipo de juego elegido. */
  function startLesson(choice: LessonChoice, mode: LessonMode) {
    const topic = topics.find((t) => t.id === choice);
    const plan = topic ? planTopicSession(topic, progress.words) : todaysPlan();
    setScreen({ name: 'session', plan, mode });
  }

  function finish(results: Record<string, boolean>) {
    let words = progress.words;
    for (const [key, firstTry] of Object.entries(results)) words = recordResult(words, key, firstTry, day);

    // Una ficha por noche, como en Duolingo; repetir la sesión el mismo día no da otra.
    const earnsPiece = !playedToday;
    const next = {
      words,
      sessionDays: earnsPiece ? [...progress.sessionDays, day] : progress.sessionDays,
      pieces: progress.pieces + (earnsPiece ? 1 : 0),
    };
    setProgress(next);
    saveProgress(next);

    if (earnsPiece) {
      const topic = topics[Math.floor(progress.pieces / PUZZLE_PIECES) % topics.length];
      setScreen({ name: 'puzzle', topic, placedBefore: progress.pieces % PUZZLE_PIECES });
    } else {
      setScreen({ name: 'night' });
    }
  }

  const home = () => setScreen({ name: 'home' });
  switch (screen.name) {
    case 'home':
      return (
        <Home
          playedToday={playedToday}
          onStart={() => setScreen({ name: 'session', plan: todaysPlan(), mode: 'mix' })}
          onParents={() => setScreen({ name: 'gate' })}
        />
      );
    case 'gate':
      return <ParentGate onPass={() => setScreen({ name: 'parents' })} onCancel={home} />;
    case 'parents':
      return <ParentZone progress={progress.words} playedToday={playedToday} onStart={startLesson} onClose={home} />;
    case 'session':
      return <Session plan={screen.plan} progress={progress.words} mode={screen.mode} onFinish={finish} />;
    case 'puzzle':
      return <PuzzleScreen topic={screen.topic} placedBefore={screen.placedBefore} onDone={() => setScreen({ name: 'night' })} />;
    case 'night':
      return <GoodNight />;
  }
}
