import { Buddy } from '../components/Buddy.tsx';
import { say } from '../lib/audio.ts';

interface Props {
  /** Ya jugó hoy: Buddy duerme y la invita a volver mañana. */
  playedToday: boolean;
  onStart: () => void;
}

export function Home({ playedToday, onStart }: Props) {
  if (playedToday) {
    return (
      <main className="screen home">
        <div className="moon" aria-hidden>🌙</div>
        <Buddy pose="sleeping" size={220} onClick={() => say('common/see-you-tomorrow')} />
      </main>
    );
  }
  // El primer toque (▶) también desbloquea el audio en tablets y celulares.
  return (
    <main className="screen home">
      <Buddy pose="hello" size={220} />
      <button className="play" onClick={onStart} aria-label="Play">
        ▶
      </button>
    </main>
  );
}
