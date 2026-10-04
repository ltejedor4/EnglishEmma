import { Buddy } from '../components/Buddy.tsx';
import { Moon, Screen } from '../components/Screen.tsx';
import { say } from '../lib/audio.ts';

interface Props {
  /** Ya jugó hoy: Buddy duerme y la invita a volver mañana. */
  playedToday: boolean;
  onStart: () => void;
}

export function Home({ playedToday, onStart }: Props) {
  if (playedToday) {
    return (
      <Screen className="gap-10" background="bg-home">
        <Moon />
        <Buddy pose="sleeping" size={220} onClick={() => say('common/see-you-tomorrow')} />
      </Screen>
    );
  }
  // El primer toque (▶) también desbloquea el audio en tablets y celulares.
  return (
    <Screen className="gap-10" background="bg-home">
      <Buddy pose="hello" size={220} />
      <button className="moon-button size-32 pl-2.5 text-[56px] active:scale-95" onClick={onStart} aria-label="Play">
        ▶
      </button>
    </Screen>
  );
}
