import { Buddy } from '../components/Buddy.tsx';
import { Moon, Screen } from '../components/Screen.tsx';
import { say } from '../lib/audio.ts';

interface Props {
  /** Ya jugó hoy: Buddy duerme, pero puede practicar otra vez (sin ficha nueva). */
  playedToday: boolean;
  onStart: () => void;
  onParents: () => void;
}

/** Botón discreto de la zona de padres (protegida con una suma). */
function ParentsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="absolute top-[max(16px,env(safe-area-inset-top))] left-4 size-12 rounded-full bg-white/10 text-2xl opacity-60"
      onClick={onClick}
      aria-label="Padres"
    >
      ⚙️
    </button>
  );
}

export function Home({ playedToday, onStart, onParents }: Props) {
  if (playedToday) {
    return (
      <Screen className="gap-10" background="bg-home">
        <ParentsButton onClick={onParents} />
        <Moon />
        <Buddy pose="sleeping" size={220} onClick={() => say('common/see-you-tomorrow')} />
        <button className="moon-button size-22 pl-2 text-[40px] opacity-90 active:scale-95" onClick={onStart} aria-label="Practice">
          ▶
        </button>
      </Screen>
    );
  }
  // El primer toque (▶) también desbloquea el audio en tablets y celulares.
  return (
    <Screen className="gap-10" background="bg-home">
      <ParentsButton onClick={onParents} />
      <Buddy pose="hello" size={220} />
      <button className="moon-button size-32 pl-2.5 text-[56px] active:scale-95" onClick={onStart} aria-label="Play">
        ▶
      </button>
    </Screen>
  );
}
