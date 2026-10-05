import type { Pose } from './pose.ts';
import { topics } from '../content/index.ts';
import type { LessonMode } from './lesson.ts';
import { factsNaming, keyOf, pickOptions, shuffle } from './review.ts';
import type { SessionPlan, WordProgress, WordRef } from './review.ts';

/** Una ronda de un juego con varias opciones (Balloons, Feed Buddy). */
export interface GameRound {
  target: WordRef;
  options: WordRef[];
}

export type GameKind = 'memory' | 'balloons' | 'feed';
/** Juegos que rotan en la lección de la noche (en este orden). */
export const GAMES: GameKind[] = ['memory', 'balloons', 'feed'];

export type Step =
  | { kind: 'say'; keys: string[]; pose: Pose }
  | { kind: 'present'; target: WordRef }
  | { kind: 'touch'; targets: WordRef[]; options: WordRef[]; prompt: string[] }
  | { kind: 'memory'; words: WordRef[] }
  | { kind: 'balloons'; rounds: GameRound[] }
  | { kind: 'feed'; rounds: GameRound[] }
  | { kind: 'speak'; targets: WordRef[] };

/** Rondas de Listen & Touch mínimas en los modos de un solo tipo de pregunta (ask / fact / pair). */
export const MIN_ROUNDS = 8;
/** Rondas de Listen & Touch al cierre de la lección completa. */
export const CLOSING_ROUNDS = 4;
/** Una palabra no sale más de esto por sesión en Listen & Touch: insistir sí, pero intercalada. */
export const MAX_ROUNDS_PER_WORD = 3;
/** Palabras distintas mínimas para juegos y rondas extra (si la lección trae menos, se suman otras ya vistas). */
const MIN_POOL = 3;

const topicOf = (ref: WordRef) => topics.find((t) => t.id === ref.topicId)!;
export const clipOf = (ref: WordRef) => `${ref.topicId}/${ref.word.id}`;

function refOfKey(key: string): WordRef | undefined {
  const [topicId, wordId] = key.split('/');
  const word = topics.find((t) => t.id === topicId)?.words.find((w) => w.id === wordId);
  return word && { topicId, word };
}

export interface LessonOptions {
  mode?: LessonMode;
  /** Cambia cada noche (número de noches jugadas): decide qué juegos tocan hoy. */
  seed?: number;
  /** Práctica libre: un solo juego. */
  practice?: boolean;
  /** Incluir "Your turn! Say it!" (los padres pueden apagarlo). */
  speak?: boolean;
}

/** Los juegos de hoy: dos distintos que rotan cada noche; en la práctica, uno (el que no tocó primero). */
export function gamesFor(seed: number, practice: boolean): GameKind[] {
  const n = GAMES.length;
  const first = ((seed % n) + n) % n;
  return practice ? [GAMES[(first + 2) % n]] : [GAMES[first], GAMES[(first + 1) % n]];
}

/**
 * Arma la lección. En "mix" (la de la noche, 5–7 min):
 *   saludo → repaso (Listen & Touch) → palabras nuevas (presentación + pregunta directa)
 *   → juego 1 → Your turn! Say it! → juego 2 → cierre (4 Listen & Touch).
 * En "speak" (zona de padres): palabras nuevas → Say it! con hasta 6 palabras → cierre.
 * En "ask" / "fact" / "pair" (elegidos en la zona de padres): solo Listen & Touch con esa forma de preguntar.
 * Listen & Touch mezcla tres formas: ask ("Where is the dog?"), fact ("The sky is blue." → azul) y
 * pair ("Find these two! red… and… blue"). Ninguna palabra sale dos veces seguidas ni más de
 * MAX_ROUNDS_PER_WORD veces en Listen & Touch.
 */
export function buildSteps(plan: SessionPlan, progress: WordProgress, options: LessonOptions = {}): Step[] {
  const { mode = 'mix', seed = 0, practice = false, speak = true } = options;
  // Lección completa (con juegos): la mezcla, o un juego elegido en la zona de padres (ese juego dos veces).
  const chosenGame = (GAMES as string[]).includes(mode) ? (mode as GameKind) : undefined;
  const fullLesson = mode === 'mix' || mode === 'speak' || !!chosenGame;
  const steps: Step[] = [{ kind: 'say', keys: ['common/hello-emma', 'common/lets-play'], pose: 'hello' }];
  // Palabras que ya vio: preferidas como distractores. Las nuevas cuentan recién después de presentarlas.
  const known = new Set(Object.keys(progress));
  const box = (ref: WordRef) => progress[keyOf(ref)]?.box ?? 0;
  // Más opciones cuanto mejor la sabe: caja 0 → 2, caja 1 → 3, caja 2+ → 4.
  const countFor = (ref: WordRef) => 2 + Math.min(box(ref), 2);

  const ask = (target: WordRef, count: number): Extract<Step, { kind: 'touch' }> => ({
    kind: 'touch',
    targets: [target],
    options: pickOptions(target, topicOf(target), count, known),
    prompt: [`${clipOf(target)}-ask`],
  });
  const fact = (target: WordRef, count: number): Step => {
    const facts = factsNaming(target.word, topicOf(target));
    if (!facts.length) return ask(target, count);
    const n = facts[Math.floor(Math.random() * facts.length)];
    return { ...ask(target, count), prompt: [`${clipOf(target)}-fact-${n}`] };
  };
  const pair = (a: WordRef, b: WordRef): Step => ({
    kind: 'touch',
    targets: [a, b],
    options: pickOptions([a, b], topicOf(a), 4, known),
    prompt: ['common/find-these-two', clipOf(a), 'common/and', clipOf(b)],
  });
  const touches = () => steps.filter((s): s is Extract<Step, { kind: 'touch' }> => s.kind === 'touch');
  const lastTargets = () => touches().at(-1)?.targets.map(keyOf) ?? [];
  // Una sola palabra: según el modo, o alternando pregunta directa y frase.
  const single = (target: WordRef, count: number, variant: number): Step =>
    mode === 'ask' || (mode !== 'fact' && variant % 2 === 0) ? ask(target, count) : fact(target, count);
  const canPair = (a: WordRef, b: WordRef | undefined): b is WordRef => !!b && a.topicId === b.topicId;
  /** Saca de la lista la próxima palabra que no estuvo en la ronda anterior (undefined si no hay). */
  const takeNext = (remaining: WordRef[], avoid: string[] = lastTargets()) => {
    const i = remaining.findIndex((ref) => !avoid.includes(keyOf(ref)));
    return i < 0 ? undefined : remaining.splice(i, 1)[0];
  };

  // --- Repaso ---
  if (plan.review.length) {
    steps.push({ kind: 'say', keys: ['common/lets-review'], pose: 'hello' });
    const remaining = shuffle(plan.review);
    for (let variant = 0; remaining.length; variant++) {
      const a = takeNext(remaining);
      if (!a) break;
      const b = remaining.find((ref) => canPair(a, ref) && !lastTargets().includes(keyOf(ref)));
      // Las que ya sabe (caja 1+) y son del mismo tema pueden ir de a dos.
      if (b && (mode === 'pair' || (mode === 'mix' && variant % 3 === 0 && box(a) >= 1 && box(b) >= 1))) {
        remaining.splice(remaining.indexOf(b), 1);
        steps.push(pair(a, b));
      } else {
        steps.push(single(a, countFor(a), variant));
      }
    }
  }

  // --- Palabras nuevas ---
  if (plan.fresh.length) {
    steps.push({ kind: 'say', keys: ['common/new-words'], pose: 'cheer' });
    for (const target of plan.fresh) {
      steps.push({ kind: 'present', target });
      known.add(keyOf(target));
    }
    steps.push({ kind: 'say', keys: ['common/lets-play-a-game'], pose: 'hello' });
    // Primero la pregunta directa con 2 opciones (para conocerlas). En la lección completa los juegos
    // hacen el resto; en los otros modos, una segunda ronda con 3 opciones y la forma elegida.
    // Una palabra que no puede ir sin repetir la ronda anterior queda para más adelante.
    for (const [round, count] of (fullLesson ? [2] : [2, 3]).entries()) {
      const remaining = shuffle(plan.fresh);
      while (remaining.length) {
        const a = takeNext(remaining);
        if (!a) break;
        const b = round > 0 && mode === 'pair' ? remaining.find((ref) => canPair(a, ref) && !lastTargets().includes(keyOf(ref))) : undefined;
        if (b) {
          remaining.splice(remaining.indexOf(b), 1);
          steps.push(pair(a, b));
        } else if (round === 0) steps.push(ask(a, count));
        else steps.push(mode === 'ask' ? ask(a, count) : fact(a, count));
      }
    }
  }

  // Bolsa de palabras para juegos y rondas extra. Si la lección trae pocas (por ejemplo, solo la que le
  // cuesta), se suman otras que ya vio: la difícil sale más, pero intercalada.
  const pool = [...plan.fresh, ...plan.review];
  const extra = Object.entries(progress)
    .sort(([, a], [, b]) => a.box - b.box || a.lastSeen.localeCompare(b.lastSeen))
    .map(([key]) => refOfKey(key))
    .filter((ref): ref is WordRef => !!ref && !pool.some((p) => keyOf(p) === keyOf(ref)));
  pool.push(...extra.slice(0, Math.max(0, MIN_POOL - pool.length)));
  for (const ref of pool) known.add(keyOf(ref));

  // --- Juegos (solo en la lección completa) ---
  if (fullLesson && pool.length >= 2) {
    const games = chosenGame
      ? practice ? [chosenGame] : [chosenGame, chosenGame]
      : mode === 'speak' ? [] : gamesFor(seed, practice);
    // Las nuevas primero (son las que más necesita oír y decir), luego las demás al azar.
    const ordered = () => [...plan.fresh, ...shuffle(pool.filter((ref) => !plan.fresh.includes(ref)))];
    if (mode === 'speak' && speak) steps.push({ kind: 'speak', targets: ordered().slice(0, 6) });
    for (const [i, game] of games.entries()) {
      // Hablar va entre el primer y el segundo juego (o después del único, en la práctica).
      if (i === 1 && speak && !chosenGame) steps.push({ kind: 'speak', targets: ordered().slice(0, 4) });
      steps.push({ kind: 'say', keys: ['common/lets-play-a-game'], pose: 'cheer' });
      const words = ordered();
      if (game === 'memory') {
        steps.push({ kind: 'memory', words: words.slice(0, 3) });
      } else {
        // 5 rondas por juego (o tantas como palabras distintas haya, sin repetir objetivo).
        const targets = shuffle(words.slice(0, 5));
        const count = game === 'balloons' ? 4 : 3;
        steps.push({
          kind: game,
          rounds: targets.map((target) => ({ target, options: pickOptions(target, topicOf(target), count, known) })),
        });
      }
    }
    if (games.length === 1 && speak && !chosenGame) steps.push({ kind: 'speak', targets: ordered().slice(0, 4) });
  }

  // --- Cierre / rondas extra de Listen & Touch ---
  const goal = fullLesson ? touches().length + CLOSING_ROUNDS : MIN_ROUNDS;
  if (pool.length && touches().length < goal) {
    steps.push({ kind: 'say', keys: ['common/lets-play-a-game'], pose: 'cheer' });
    const uses = (ref: WordRef) =>
      touches().filter((s) => s.targets.some((t) => keyOf(t) === keyOf(ref))).length;
    for (let variant = 0; touches().length < goal; variant++) {
      // Las menos usadas primero (al azar entre iguales); nunca la de la ronda anterior ni una ya agotada.
      const candidates = shuffle(pool)
        .filter((ref) => uses(ref) < MAX_ROUNDS_PER_WORD && !lastTargets().includes(keyOf(ref)))
        .sort((a, b) => uses(a) - uses(b));
      if (!candidates.length) break;
      const a = candidates[0];
      const b = candidates.slice(1).find((ref) => canPair(a, ref));
      if (b && (mode === 'pair' || (mode === 'mix' && variant % 3 === 1))) steps.push(pair(a, b));
      else steps.push(single(a, Math.max(3, countFor(a)), variant + (fullLesson ? 1 : 0)));
    }
  }
  return steps;
}

/** Cuántas veces tiene que tocar/responder Emma en la lección (para medir su duración). */
export function interactions(steps: Step[]): number {
  return steps.reduce((sum, s) => {
    if (s.kind === 'touch' || s.kind === 'present') return sum + 1;
    if (s.kind === 'memory') return sum + s.words.length * 2 + 2; // pares + algún error de memoria
    if (s.kind === 'balloons' || s.kind === 'feed') return sum + s.rounds.length;
    if (s.kind === 'speak') return sum + s.targets.length;
    return sum;
  }, 0);
}

/** Todos los clips que puede necesitar la sesión, para precargarlos. */
export function audioKeys(steps: Step[]): string[] {
  return steps.flatMap((step) => {
    if (step.kind === 'say') return step.keys;
    if (step.kind === 'present') return [clipOf(step.target), `${clipOf(step.target)}-fact-1`];
    if (step.kind === 'memory' || step.kind === 'speak') return (step.kind === 'memory' ? step.words : step.targets).map(clipOf);
    if (step.kind === 'balloons' || step.kind === 'feed') return step.rounds.flatMap((r) => r.options.map(clipOf));
    return [...step.prompt, ...step.targets.map(clipOf)];
  });
}
