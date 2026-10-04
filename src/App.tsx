import { useState } from 'react';
import { topics } from './content/index.ts';
import type { Topic } from './content/types.ts';
import { loadProgress, saveProgress } from './lib/progress.ts';
import { planSession, recordResult, today } from './lib/review.ts';
import type { SessionPlan } from './lib/review.ts';
import { GoodNight } from './screens/GoodNight.tsx';
import { Home } from './screens/Home.tsx';
import { PUZZLE_PIECES, PuzzleScreen } from './screens/PuzzleScreen.tsx';
import { Session } from './screens/Session.tsx';

/** Con ?libre en la URL se puede jugar más de una sesión por día (para probar). */
const FREE_PLAY = new URLSearchParams(location.search).has('libre');

type Screen =
  | { name: 'home' }
  | { name: 'session'; plan: SessionPlan }
  | { name: 'puzzle'; topic: Topic; placedBefore: number }
  | { name: 'night' };

export default function App() {
  const [progress, setProgress] = useState(loadProgress);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const day = today();
  const playedToday = progress.sessionDays.includes(day);

  function start() {
    setScreen({ name: 'session', plan: planSession(topics, progress.words, day) });
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

  switch (screen.name) {
    case 'home':
      return <Home playedToday={playedToday && !FREE_PLAY} onStart={start} />;
    case 'session':
      return <Session plan={screen.plan} progress={progress.words} onFinish={finish} />;
    case 'puzzle':
      return <PuzzleScreen topic={screen.topic} placedBefore={screen.placedBefore} onDone={() => setScreen({ name: 'night' })} />;
    case 'night':
      return <GoodNight />;
  }
}
