import { BackButton } from '../components/BackButton.tsx';
import { PuzzleBoard } from '../components/PuzzleBoard.tsx';
import { Screen } from '../components/Screen.tsx';
import { puzzleTopics } from '../content/index.ts';
import { image } from '../lib/images.ts';
import { puzzleFill } from '../lib/nights.ts';
import { PUZZLE_PIECES } from '../lib/puzzle.ts';

/**
 * Centro de cada isla de bg-map.webp (en % de la imagen), siguiendo el camino punteado.
 * La imagen tiene 10 islas; el rompecabezas 11 (Hello!) va sobre el sol del horizonte.
 */
const ISLANDS: [x: number, y: number][] = [
  [13.3, 24], [38.4, 30.3], [63.8, 37.6], [86, 36.3], [87.9, 61.7],
  [65.1, 59], [39, 56.5], [12.4, 51.8], [22.1, 75.2], [78.1, 84.5],
  [61.2, 10.3],
];

interface Props {
  /** Fichas ganadas en total. */
  pieces: number;
  /** Abre un rompecabezas que ya tiene alguna ficha (índice en puzzleTopics). */
  onOpen: (index: number) => void;
  onClose: () => void;
}

/** Mapa de islas = álbum de rompecabezas: los completos se ven enteros, el actual con sus huecos. */
export function MapScreen({ pieces, onOpen, onClose }: Props) {
  const fill = puzzleFill(pieces, puzzleTopics.length, PUZZLE_PIECES);
  const map = image('bg-map');
  const star = image('sticker-star');
  return (
    <Screen className="p-0!">
      <BackButton onClick={onClose} />
      <div className="relative aspect-3/2 w-[min(100vw,150dvh)] overflow-hidden bg-night-soft" data-map>
        {map && <img src={map} alt="" draggable={false} className="pointer-events-none size-full" />}
        {puzzleTopics.map((topic, i) => {
          if (!ISLANDS[i]) return null;
          const [x, y] = ISLANDS[i];
          const filled = fill[i];
          const complete = filled === PUZZLE_PIECES;
          const icon = image(`topic-${topic.id}`);
          return (
            <button
              key={topic.id}
              className="absolute w-[10.5%] -translate-1/2 border-none bg-transparent p-0 active:scale-95 disabled:cursor-default"
              style={{ left: `${x}%`, top: `${y}%` }}
              disabled={!filled}
              onClick={() => onOpen(i)}
              aria-label={topic.title}
              data-island={topic.id}
              data-filled={filled}
            >
              {filled ? (
                <PuzzleBoard
                  topic={topic}
                  filled={filled}
                  className={`w-full rounded-[10%] p-[3%] ${complete ? 'bg-moon shadow-[0_0_0_4px_rgb(255_233_168/0.4)]' : 'bg-night/60'}`}
                />
              ) : (
                // Todavía sin fichas: se adivina qué viene.
                <span className="mx-auto grid aspect-square w-[62%] place-items-center text-4xl opacity-45 grayscale">
                  {icon ? <img src={icon} alt="" className="size-full object-contain" draggable={false} /> : topic.icon}
                </span>
              )}
              {complete && (
                <span className="absolute -top-[22%] -right-[10%] grid w-[38%] place-items-center text-2xl">
                  {star ? <img src={star} alt="" className="w-full" draggable={false} /> : '⭐'}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Screen>
  );
}
