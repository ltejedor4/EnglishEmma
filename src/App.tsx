import { useState } from 'react';
import { puzzleTopics, topics } from './content/index.ts';
import type { Topic } from './content/types.ts';
import type { LessonMode } from './lib/lesson.ts';
import { EMPTY_PROGRESS, loadProgress, recordSpoken, saveProgress } from './lib/progress.ts';
import type { Progress, Settings } from './lib/progress.ts';
import { doingWell, keyOf, planSession, planTopicSession, recordResult, refsOf, resetTopic, today } from './lib/review.ts';
import type { SessionPlan } from './lib/review.ts';
import { Home } from './screens/Home.tsx';
import { ParentGate } from './screens/ParentGate.tsx';
import { ParentZone } from './screens/ParentZone.tsx';
import type { LessonChoice } from './screens/ParentZone.tsx';
import { PUZZLE_PIECES, PuzzleScreen } from './screens/PuzzleScreen.tsx';
import { Session } from './screens/Session.tsx';

type Screen =
  | { name: 'home'; justFinished?: boolean }
  | { name: 'gate' }
  | { name: 'parents' }
  | { name: 'session'; plan: SessionPlan; mode: LessonMode; practice: boolean }
  | { name: 'puzzle'; topic: Topic; placedBefore: number };

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
    setScreen({ name: 'session', plan, mode, practice: playedToday });
  }

  function update(next: Progress) {
    setProgress(next);
    saveProgress(next);
  }

  /** Zona de padres: un tema vuelve a estar como nuevo (las fichas del rompecabezas no se tocan). */
  function resetTopicProgress(topicId: string) {
    const topic = topics.find((t) => t.id === topicId);
    if (!topic) return;
    const keys = new Set(refsOf(topic).map(keyOf));
    const spoken = Object.fromEntries(Object.entries(progress.spoken).filter(([key]) => !keys.has(key)));
    update({ ...progress, words: resetTopic(progress.words, topic), spoken });
  }

  function finish(results: Record<string, boolean>, spoken: string[]) {
    let words = progress.words;
    for (const [key, firstTry] of Object.entries(results)) words = recordResult(words, key, firstTry, day);

    // Una ficha por noche, como en Duolingo; repetir la sesión el mismo día no da otra.
    const earnsPiece = !playedToday;
    const next = {
      ...progress,
      words,
      spoken: recordSpoken(progress.spoken, spoken, day),
      sessionDays: earnsPiece ? [...progress.sessionDays, day] : progress.sessionDays,
      pieces: progress.pieces + (earnsPiece ? 1 : 0),
    };
    update(next);

    if (earnsPiece) {
      const topic = puzzleTopics[Math.floor(progress.pieces / PUZZLE_PIECES) % puzzleTopics.length];
      setScreen({ name: 'puzzle', topic, placedBefore: progress.pieces % PUZZLE_PIECES });
    } else {
      setScreen({ name: 'home', justFinished: true });
    }
  }

  const home = () => setScreen({ name: 'home' });
  switch (screen.name) {
    case 'home':
      return (
        <Home
          key={String(screen.justFinished)}
          playedToday={playedToday}
          justFinished={screen.justFinished}
          onStart={() => setScreen({ name: 'session', plan: todaysPlan(), mode: 'mix', practice: playedToday })}
          onParents={() => setScreen({ name: 'gate' })}
        />
      );
    case 'gate':
      return <ParentGate onPass={() => setScreen({ name: 'parents' })} onCancel={home} />;
    case 'parents':
      return (
        <ParentZone
          progress={progress}
          playedToday={playedToday}
          onStart={startLesson}
          onSettings={(settings: Settings) => update({ ...progress, settings, speechIssue: undefined })}
          onResetTopic={resetTopicProgress}
          onResetAll={() => update({ ...EMPTY_PROGRESS, settings: progress.settings })}
          onClose={home}
        />
      );
    case 'session':
      return (
        <Session
          plan={screen.plan}
          progress={progress.words}
          mode={screen.mode}
          seed={progress.sessionDays.length}
          practice={screen.practice}
          speech={progress.settings.speech}
          onSpeechIssue={(reason) => update({ ...progress, speechIssue: reason })}
          onFinish={finish}
        />
      );
    case 'puzzle':
      return <PuzzleScreen topic={screen.topic} placedBefore={screen.placedBefore} onDone={() => setScreen({ name: 'home', justFinished: true })} />;
  }
}
