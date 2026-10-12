import { useEffect, useMemo, useState } from 'react';
import { SceneBoard } from '../components/SceneBoard.tsx';
import { GameArea } from '../components/Screen.tsx';
import { SpeakerButton } from '../components/SpeakerButton.tsx';
import { Stars } from '../components/Stars.tsx';
import { topics } from '../content/index.ts';
import { randomCelebration, say } from '../lib/audio.ts';
import { SCENE_WIDTH } from '../lib/puzzle.ts';
import type { WordRef } from '../lib/review.ts';
import type { RoundResult } from './ListenTouch.tsx';

const clipOf = (ref: WordRef) => `${ref.topicId}/${ref.word.id}`;

interface Props {
  topicId: string;
  targets: WordRef[];
  onDone: (results: RoundResult[]) => void;
}

/**
 * Find it in the scene: "Where is the dog?" → tocarlo dentro de la escena del rompecabezas del tema.
 * Tocar otra cosa no castiga ni muestra la respuesta ("Let's try again!"); tocar el fondo no hace nada.
 */
export function FindInScene({ topicId, targets, onDone }: Props) {
  const topic = topics.find((t) => t.id === topicId)!;
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [found, setFound] = useState(false);
  const [missed, setMissed] = useState(false);
  const [shaking, setShaking] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const target = targets[index];
  const prompt = useMemo(() => [`${clipOf(target)}-ask`], [target]);

  useEffect(() => {
    say(...(index === 0 ? ['common/find-in-picture'] : []), ...prompt);
  }, [index, prompt]);

  async function touch(wordId: string) {
    if (busy || found) return;
    if (wordId === target.word.id) {
      setFound(true);
      if (!(await say(clipOf(target), randomCelebration()))) return;
      const all = [...results, { target, firstTry: !missed }];
      if (index + 1 >= targets.length) return onDone(all);
      setResults(all);
      setFound(false);
      setMissed(false);
      setIndex(index + 1);
      return;
    }
    setMissed(true);
    setShaking(wordId);
    setBusy(true);
    await say('common/try-again');
    setBusy(false);
    setShaking(null);
  }

  return (
    <GameArea>
      <SpeakerButton onClick={() => !found && say(...prompt)} />
      <div className="relative" data-find={prompt.join(' ')}>
        <SceneBoard topic={topic} onTouch={touch} marked={found ? [target.word.id] : []} shaking={shaking} className={SCENE_WIDTH} />
        {found && <Stars />}
      </div>
    </GameArea>
  );
}
