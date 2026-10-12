import { useEffect, useState } from 'react';
import { BackButton } from '../components/BackButton.tsx';
import { PuzzleBoard } from '../components/PuzzleBoard.tsx';
import { SceneBoard } from '../components/SceneBoard.tsx';
import { Screen } from '../components/Screen.tsx';
import type { Topic } from '../content/types.ts';
import { say } from '../lib/audio.ts';
import { PUZZLE_PIECES, SCENE_WIDTH } from '../lib/puzzle.ts';

interface Props {
  topic: Topic;
  /** Fichas ya puestas en este rompecabezas. */
  filled: number;
  onClose: () => void;
}

/**
 * Un rompecabezas del álbum en grande. Si está completo cobra vida: cada cosa es tocable y dice su
 * palabra ("Dog!"), así que el premio también es un repaso. Si no, se ve con sus huecos.
 */
export function AlbumPuzzle({ topic, filled, onClose }: Props) {
  const complete = filled >= PUZZLE_PIECES;
  const [last, setLast] = useState<string | null>(null);

  useEffect(() => {
    if (complete) say('common/touch-to-listen');
  }, [complete]);

  return (
    <Screen>
      <BackButton onClick={onClose} />
      {complete ? (
        <SceneBoard
          topic={topic}
          marked={last ? [last] : []}
          className={SCENE_WIDTH}
          onTouch={(wordId) => {
            setLast(wordId);
            say(`${topic.id}/${wordId}`);
          }}
        />
      ) : (
        <PuzzleBoard topic={topic} filled={filled} className={`${SCENE_WIDTH} rounded-[20px] bg-white/10 p-1`} />
      )}
    </Screen>
  );
}
