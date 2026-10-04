import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Buddy } from '../components/Buddy.tsx';
import { Moon, Screen } from '../components/Screen.tsx';
import { say } from '../lib/audio.ts';

interface Props {
  /** Ya jugó hoy: Buddy duerme, pero puede practicar otra vez (sin ficha nueva). */
  playedToday: boolean;
  /** Recién terminó una sesión: primero "Good night, Emma! Sweet dreams!" y después aparecen los botones. */
  justFinished?: boolean;
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

export function Home({ playedToday, justFinished = false, onStart, onParents }: Props) {
  const [saying, setSaying] = useState(justFinished);

  useEffect(() => {
    if (!justFinished) return;
    let alive = true;
    say('common/good-night-emma', 'common/sweet-dreams').then(() => alive && setSaying(false));
    return () => {
      alive = false;
    };
  }, [justFinished]);

  if (playedToday) {
    return (
      <Screen className="gap-10" background="bg-home">
        <Moon />
        <Buddy pose={saying ? 'sleepy' : 'sleeping'} size={220} onClick={() => !saying && say('common/see-you-tomorrow')} />
        {!saying && (
          <>
            <ParentsButton onClick={onParents} />
            <motion.button
              className="moon-button size-22 pl-2 text-[40px] opacity-90 active:scale-95"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 0.9, scale: 1 }}
              transition={{ duration: 0.6 }}
              onClick={onStart}
              aria-label="Practice"
            >
              ▶
            </motion.button>
          </>
        )}
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
