import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Buddy } from '../components/Buddy.tsx';
import { NightCalendar } from '../components/NightCalendar.tsx';
import { Moon, Screen } from '../components/Screen.tsx';
import { say } from '../lib/audio.ts';
import { image } from '../lib/images.ts';

interface Props {
  /** Ya jugó hoy: Buddy duerme, pero puede practicar otra vez (sin ficha nueva). */
  playedToday: boolean;
  /** Recién terminó una sesión: primero "Good night, Emma! Sweet dreams!" y después aparecen los botones. */
  justFinished?: boolean;
  /** Días en que terminó una sesión y el día de hoy, para el calendario de noches. */
  sessionDays: string[];
  day: string;
  onStart: () => void;
  onMap: () => void;
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

/** Botón del mapa de islas (su álbum de rompecabezas): una miniatura del mapa, sin texto. */
function MapButton({ onClick }: { onClick: () => void }) {
  const map = image('bg-map');
  return (
    <button
      className="absolute right-5 bottom-[max(20px,env(safe-area-inset-bottom))] grid size-22 place-items-center rounded-full border-4 border-moon bg-night-soft bg-cover bg-center text-4xl shadow-[0_6px_0_rgb(0_0_0/0.25)] active:scale-95"
      style={map ? { backgroundImage: `url("${map}")` } : undefined}
      onClick={onClick}
      aria-label="Map"
      data-map-button
    >
      {!map && '🗺️'}
    </button>
  );
}

export function Home({ playedToday, justFinished = false, sessionDays, day, onStart, onMap, onParents }: Props) {
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
        <NightCalendar sessionDays={sessionDays} day={day} />
        <Buddy pose={saying ? 'sleepy' : 'sleeping'} size={220} onClick={() => !saying && say('common/see-you-tomorrow')} />
        {!saying && (
          <>
            <ParentsButton onClick={onParents} />
            <MapButton onClick={onMap} />
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
      <NightCalendar sessionDays={sessionDays} day={day} />
      <MapButton onClick={onMap} />
      <Buddy pose="hello" size={220} />
      <button className="moon-button size-32 pl-2.5 text-[56px] active:scale-95" onClick={onStart} aria-label="Play">
        ▶
      </button>
    </Screen>
  );
}
