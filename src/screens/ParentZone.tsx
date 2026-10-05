import { useEffect, useState } from 'react';
import { topics } from '../content/index.ts';
import { image } from '../lib/images.ts';
import { LESSON_MODES } from '../lib/lesson.ts';
import type { LessonMode } from '../lib/lesson.ts';
import { isLearned, keyOf, refsOf } from '../lib/review.ts';
import type { Progress, Settings } from '../lib/progress.ts';
import { canRecognize, canRecord } from '../lib/speech.ts';
import type { SpeechMode } from '../lib/speech.ts';

/** 'today' = la lección automática de la noche; si no, el id de un tema. */
export type LessonChoice = 'today' | string;

interface Props {
  progress: Progress;
  playedToday: boolean;
  onStart: (choice: LessonChoice, mode: LessonMode) => void;
  onSettings: (settings: Settings) => void;
  onResetTopic: (topicId: string) => void;
  onResetAll: () => void;
  onClose: () => void;
}

/** Zona de padres: elegir tema y tipo de juego, ver cómo va, misiones para casa y reiniciar el progreso. */
export function ParentZone({ progress, playedToday, onStart, onSettings, onResetTopic, onResetAll, onClose }: Props) {
  const words = progress.words;
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
              const seen = refs.filter((ref) => words[keyOf(ref)]).length;
              const learned = refs.filter((ref) => isLearned(words[keyOf(ref)])).length;
              const said = refs.filter((ref) => progress.spoken[keyOf(ref)]?.length).length;
              const answered = (t.questions ?? []).filter((q) => progress.spoken[`${t.id}/q-${q.id}`]?.length).length;
              const icon = image(`topic-${t.id}`);
              return (
                <div key={t.id} className="relative">
                  <button
                    className={`${option(choice === t.id)} w-full ${seen ? 'pr-28' : ''}`}
                    onClick={() => setChoice(t.id)}
                    data-choice={t.id}
                  >
                    {icon ? <img src={icon} alt="" className="size-12" /> : <span className="text-4xl">{t.icon}</span>}
                    <span>
                      <span className="block font-semibold">{t.title}</span>
                      <span className="text-sm text-cream/70">
                        {seen ? `Vio ${seen} de ${refs.length} · aprendió ${learned}${said ? ` · dijo ${said}` : ''}` : 'Todavía no empezó'}
                        {answered > 0 && ` · respondió ${answered} de ${t.questions!.length} preguntas`}
                      </span>
                    </span>
                  </button>
                  {seen > 0 && (
                    <ConfirmButton
                      className="absolute top-1/2 right-3 -translate-y-1/2"
                      label="Reiniciar"
                      armedLabel="¿Borrar?"
                      onConfirm={() => onResetTopic(t.id)}
                      data-reset={t.id}
                    />
                  )}
                </div>
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

        <SpeechSettings mode={progress.settings.speech} issue={progress.speechIssue} onChange={(speech) => onSettings({ ...progress.settings, speech })} />

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

        <section className="mt-4 flex flex-col items-center gap-2 border-t border-white/10 pt-6">
          <ConfirmButton label="Reiniciar todo" onConfirm={onResetAll} data-reset="all" />
          <p className="m-0 text-center text-sm text-cream/60">
            Borra todas las palabras, las fichas del rompecabezas y las noches jugadas.
          </p>
        </section>
      </div>
    </main>
  );
}

/**
 * Botón que pide un segundo toque: el primero lo pone en rojo ("¿Borrar?") y,
 * si no se confirma en 4 segundos, vuelve a la normalidad.
 */
function ConfirmButton({
  label,
  onConfirm,
  className = '',
  armedLabel = '¿Borrar? Toca otra vez',
  ...rest
}: { label: string; armedLabel?: string; onConfirm: () => void; className?: string } & Record<`data-${string}`, string>) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(timer);
  }, [armed]);

  return (
    <button
      {...rest}
      className={`rounded-full px-4 py-2 text-sm font-semibold active:scale-95 ${
        armed ? 'bg-red-500 text-white' : 'bg-white/12 text-cream/80'
      } ${className}`}
      onClick={() => {
        if (!armed) return setArmed(true);
        setArmed(false);
        onConfirm();
      }}
    >
      {armed ? armedLabel : `↺ ${label}`}
    </button>
  );
}

const SPEECH_MODES: { id: SpeechMode; icon: string; label: string; hint: string }[] = [
  { id: 'auto', icon: '🎤', label: 'Automático', hint: 'Escucha y celebra si se parece (muy generoso). Necesita internet.' },
  { id: 'record', icon: '👂', label: 'Grabar y escucharse', hint: 'Se graba, se escucha y toca ✅. Sin internet; la voz no sale de la tablet.' },
  { id: 'off', icon: '🔇', label: 'Apagado', hint: 'Las lecciones no incluyen hablar.' },
];

const ISSUES: Record<string, string> = {
  'not-allowed': 'El micrófono está bloqueado. Habilítalo en los permisos del sitio (candado junto a la dirección, o Ajustes del navegador → Micrófono) y vuelve a intentar.',
  'service-not-allowed': 'Este dispositivo no permite el reconocimiento de voz dentro de la app; se usó "Grabar y escucharse".',
  network: 'Sin internet no hay reconocimiento de voz; se usó "Grabar y escucharse".',
  'audio-capture': 'No se encontró un micrófono.',
};

/** Ajuste de "Your turn! Say it!" con su aviso de privacidad y el último problema detectado. */
function SpeechSettings({ mode, issue, onChange }: { mode: SpeechMode; issue?: string; onChange: (mode: SpeechMode) => void }) {
  const support = canRecognize()
    ? 'Este dispositivo tiene reconocimiento de voz.'
    : canRecord()
      ? 'Este dispositivo no tiene reconocimiento de voz (o no hay internet): se usa "Grabar y escucharse".'
      : 'Este dispositivo no permite usar el micrófono: Emma repite después de Buddy y toca ✅.';
  return (
    <section className="flex flex-col gap-3" data-speech-settings>
      <h2 className="m-0 text-lg font-semibold text-moon">Hablar (Your turn! Say it!)</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {SPEECH_MODES.map((m) => (
          <button
            key={m.id}
            className={`flex flex-col gap-1 rounded-2xl border-3 p-3 text-left active:scale-[0.98] ${
              mode === m.id ? 'border-moon bg-white/15' : 'border-transparent bg-white/8'
            }`}
            onClick={() => onChange(m.id)}
            data-speech={m.id}
          >
            <span className="font-semibold">
              {m.icon} {m.label}
            </span>
            <span className="text-sm text-cream/70">{m.hint}</span>
          </button>
        ))}
      </div>
      <p className="m-0 text-sm text-cream/60">
        {support} En Chrome, el modo automático envía la voz a los servidores de Google para reconocerla.
      </p>
      {issue && (
        <p className="m-0 rounded-xl bg-red-500/20 p-3 text-sm" data-speech-issue>
          ⚠️ {ISSUES[issue] ?? `Hubo un problema con el micrófono (${issue}).`}
        </p>
      )}
    </section>
  );
}
