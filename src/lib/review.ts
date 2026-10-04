import type { Topic, Word } from '../content/types.ts';

/** Una palabra junto con el tema al que pertenece (las rutas de audio dependen de ambos). */
export interface WordRef {
  topicId: string;
  word: Word;
}

export interface WordState {
  /** Caja de Leitner: 0 = repasar en la próxima sesión … MAX_BOX = repasar cada pocos días. */
  box: number;
  lastSeen: string;
  /** Días (YYYY-MM-DD) en que la acertó a la primera. */
  firstTryDays: string[];
}

export type WordProgress = Record<string, WordState>;

/** Días que pasan antes de volver a repasar una palabra, según su caja. */
export const INTERVALS = [0, 1, 2, 4];
export const MAX_BOX = INTERVALS.length - 1;
/** Aciertos a la primera, en días distintos, para considerar una palabra aprendida. */
export const LEARNED_DAYS = 3;
/** Fracción de palabras aprendidas de un tema para empezar el siguiente. */
export const UNLOCK_RATIO = 0.5;

export const keyOf = (ref: WordRef) => `${ref.topicId}/${ref.word.id}`;

export function today(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function daysBetween(from: string, to: string): number {
  const utc = (day: string) => {
    const [y, m, d] = day.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((utc(to) - utc(from)) / 86_400_000);
}

export const isLearned = (state?: WordState) => !!state && state.firstTryDays.length >= LEARNED_DAYS;

const isDue = (state: WordState, day: string) => daysBetween(state.lastSeen, day) >= INTERVALS[state.box];

export const refsOf = (topic: Topic): WordRef[] => topic.words.map((word) => ({ topicId: topic.id, word }));

/** Tema del que salen las palabras nuevas: el primero con palabras sin ver, si el anterior ya va bien. */
export function currentTopic(topics: Topic[], progress: WordProgress): Topic | undefined {
  for (const [i, topic] of topics.entries()) {
    if (refsOf(topic).some((ref) => !progress[keyOf(ref)])) {
      const previous = topics[i - 1];
      if (!previous) return topic;
      const learned = refsOf(previous).filter((ref) => isLearned(progress[keyOf(ref)])).length;
      return learned >= previous.words.length * UNLOCK_RATIO ? topic : undefined;
    }
  }
  return undefined;
}

export interface SessionPlan {
  review: WordRef[];
  fresh: WordRef[];
}

/** Arma la sesión de la noche: palabras pendientes de repaso + unas pocas nuevas. */
export function planSession(
  topics: Topic[],
  progress: WordProgress,
  day: string,
  { maxReview = 4, maxNew = 3 } = {},
): SessionPlan {
  const seen = topics.flatMap(refsOf).filter((ref) => progress[keyOf(ref)]);
  const state = (ref: WordRef) => progress[keyOf(ref)];

  // Si le está costando (muchas en la caja 0), menos palabras nuevas.
  const struggling = seen.filter((ref) => state(ref).box === 0).length;
  const newCount = Math.min(struggling >= 4 ? 1 : struggling >= 2 ? 2 : maxNew, maxNew);
  const topic = currentTopic(topics, progress);
  const fresh = topic ? refsOf(topic).filter((ref) => !state(ref)).slice(0, newCount) : [];

  // Sin palabras nuevas, la sesión se completa con más repaso.
  const reviewCount = fresh.length ? maxReview : maxReview + maxNew;
  const byPriority = (a: WordRef, b: WordRef) =>
    state(a).box - state(b).box || state(a).lastSeen.localeCompare(state(b).lastSeen);
  let review = seen.filter((ref) => isDue(state(ref), day)).sort(byPriority).slice(0, reviewCount);

  // Nunca una sesión vacía: si no toca nada, repasa las que más le cuestan.
  if (!fresh.length && !review.length) review = [...seen].sort(byPriority).slice(0, reviewCount);

  return { review, fresh };
}

/** Registra el resultado de una palabra en la sesión. firstTry = la acertó a la primera en todas sus rondas. */
export function recordResult(progress: WordProgress, key: string, firstTry: boolean, day: string): WordProgress {
  const prev = progress[key];
  const firstTryDays = prev?.firstTryDays ?? [];
  let next: WordState;
  if (!firstTry) {
    next = { box: 0, lastSeen: day, firstTryDays };
  } else {
    // Solo sube de caja una vez por día, aunque juegue dos sesiones.
    const box = !prev ? 1 : prev.lastSeen === day ? prev.box : Math.min(prev.box + 1, MAX_BOX);
    next = { box, lastSeen: day, firstTryDays: firstTryDays.includes(day) ? firstTryDays : [...firstTryDays, day] };
  }
  return { ...progress, [key]: next };
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Opciones para Listen & Touch: la palabra correcta + distractores del mismo tema.
 * Prefiere palabras que ya conoce, para que tenga que entender y no solo descartar la desconocida.
 */
export function pickOptions(target: WordRef, topic: Topic, count: number, known: Set<string> = new Set()): WordRef[] {
  const others = shuffle(refsOf(topic).filter((ref) => ref.word.id !== target.word.id));
  others.sort((a, b) => Number(known.has(keyOf(b))) - Number(known.has(keyOf(a))));
  return shuffle([target, ...others.slice(0, count - 1)]);
}
