import { useState } from 'react';
import { topics } from '../content/index.ts';
import { image } from '../lib/images.ts';
import { LESSON_MODES } from '../lib/lesson.ts';
import type { LessonMode } from '../lib/lesson.ts';
import { isLearned, keyOf, refsOf } from '../lib/review.ts';
import type { WordProgress } from '../lib/review.ts';

/** 'today' = la lección automática de la noche; si no, el id de un tema. */
export type LessonChoice = 'today' | string;

interface Props {
  progress: WordProgress;
  playedToday: boolean;
  onStart: (choice: LessonChoice, mode: LessonMode) => void;
  onClose: () => void;
}

/** Zona de padres: elegir tema y tipo de juego, ver cómo va y las misiones para casa. */
export function ParentZone({ progress, playedToday, onStart, onClose }: Props) {
  const [choice, setChoice] = useState<LessonChoice>('today');
  const [mode, setMode] = useState<LessonMode>('mix');
  const topic = topics.find((t) => t.id === choice);

  const option = (selected: boolean) =>
    `flex items-center gap-3 rounded-2xl border-3 p-3 text-left active:scale-[0.98] ${
      selected ? 'border-moon bg-white/15' : 'border-transparent bg-white/8'
    }`;

  return (
    <main className="h-full overflow-y-auto px-4 pt-[max(20px,env(safe-area-inset-top))] pb-10" data-parents>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <h1 className="m-0 text-2xl font-bold">Zona de papá y mamá</h1>
          <button className="size-12 rounded-full bg-white/12 text-xl" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="m-0 text-lg font-semibold text-moon">¿Qué lección?</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button className={option(choice === 'today')} onClick={() => setChoice('today')} data-choice="today">
              <span className="text-4xl">🌙</span>
              <span>
                <span className="block font-semibold">Lección de hoy</span>
                <span className="text-sm text-cream/70">La automática: repaso + palabras nuevas según cómo le va</span>
              </span>
            </button>
            {topics.map((t) => {
              const refs = refsOf(t);
              const seen = refs.filter((ref) => progress[keyOf(ref)]).length;
              const learned = refs.filter((ref) => isLearned(progress[keyOf(ref)])).length;
              const icon = image(`topic-${t.id}`);
              return (
                <button key={t.id} className={option(choice === t.id)} onClick={() => setChoice(t.id)} data-choice={t.id}>
                  {icon ? <img src={icon} alt="" className="size-12" /> : <span className="text-4xl">{t.icon}</span>}
                  <span>
                    <span className="block font-semibold">{t.title}</span>
                    <span className="text-sm text-cream/70">
                      {seen ? `Vio ${seen} de ${refs.length} · aprendió ${learned}` : 'Todavía no empezó'}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="m-0 text-lg font-semibold text-moon">¿Qué juego?</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {LESSON_MODES.map((m) => (
              <button key={m.id} className={option(mode === m.id)} onClick={() => setMode(m.id)} data-mode={m.id}>
                <span className="text-3xl">{m.icon}</span>
                <span>
                  <span className="block font-semibold">{m.label}</span>
                  <span className="text-sm text-cream/70">{m.hint}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        {topic && (
          <section className="flex flex-col gap-2 rounded-2xl bg-white/8 p-4">
            <h2 className="m-0 text-lg font-semibold text-moon">Misión para casa · {topic.title}</h2>
            <p className="m-0 text-sm text-cream/70">Frases para usar con ella en la rutina:</p>
            <ul className="m-0 flex flex-col gap-1 pl-5">
              {topic.homeMission.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex flex-col items-center gap-2">
          <button
            className="moon-button h-16 rounded-full px-10 text-xl font-bold"
            onClick={() => onStart(choice, mode)}
            data-start
          >
            ▶ Empezar
          </button>
          <p className="m-0 text-center text-sm text-cream/60">
            {playedToday
              ? 'Hoy ya ganó su ficha del rompecabezas; esta lección es de práctica.'
              : 'Es la primera sesión de hoy: al terminar gana su ficha del rompecabezas.'}
          </p>
        </div>
      </div>
    </main>
  );
}
