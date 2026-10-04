import type { Pose } from './pose.ts';
import { topics } from '../content/index.ts';
import type { LessonMode } from './lesson.ts';
import { factsNaming, keyOf, pickOptions, shuffle } from './review.ts';
import type { SessionPlan, WordProgress, WordRef } from './review.ts';

export type Step =
  | { kind: 'say'; keys: string[]; pose: Pose }
  | { kind: 'present'; target: WordRef }
  | { kind: 'touch'; targets: WordRef[]; options: WordRef[]; prompt: string[] };

/** Rondas de Listen & Touch mínimas por sesión: si hay pocas palabras, se juega más con las mismas. */
export const MIN_ROUNDS = 8;
/** Una palabra no sale más de esto por sesión: insistir sí, pero intercalada con otras. */
export const MAX_ROUNDS_PER_WORD = 3;
/** Palabras distintas mínimas para las rondas extra (si la lección trae menos, se suman otras que ya vio). */
const MIN_POOL = 3;

const topicOf = (ref: WordRef) => topics.find((t) => t.id === ref.topicId)!;
export const clipOf = (ref: WordRef) => `${ref.topicId}/${ref.word.id}`;

function refOfKey(key: string): WordRef | undefined {
  const [topicId, wordId] = key.split('/');
  const word = topics.find((t) => t.id === topicId)?.words.find((w) => w.id === wordId);
  return word && { topicId, word };
}

/**
 * Repaso → palabras nuevas → rondas extra hasta MIN_ROUNDS. Las rondas mezclan tres formas de preguntar:
 * - ask:  "Where is the dog?" / "Find the red one!"
 * - fact: una frase que la nombra, "The sky is blue." → encontrar el azul (comprensión en contexto)
 * - pair: "Find these two! red… and… blue" → tocar las dos
 * Con un modo distinto de "mix" (elegido en la zona de padres), todas las rondas usan esa forma.
 * Ninguna palabra sale dos veces seguidas ni más de MAX_ROUNDS_PER_WORD veces.
 */
export function buildSteps(plan: SessionPlan, progress: WordProgress, mode: LessonMode = 'mix'): Step[] {
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

  if (plan.fresh.length) {
    steps.push({ kind: 'say', keys: ['common/new-words'], pose: 'cheer' });
    for (const target of plan.fresh) {
      steps.push({ kind: 'present', target });
      known.add(keyOf(target));
    }
    steps.push({ kind: 'say', keys: ['common/lets-play-a-game'], pose: 'hello' });
    // Primero la pregunta directa con 2 opciones (para conocerlas); después, en el modo elegido con 3.
    // Una palabra que no puede ir sin repetir la ronda anterior queda para las rondas extra.
    for (const [round, count] of [2, 3].entries()) {
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

  // Rondas extra para que la sesión no se quede corta. Si la lección trae pocas palabras (por ejemplo,
  // solo la que le cuesta), se suman otras que ya vio: la difícil sale más, pero intercalada.
  const pool = [...plan.review, ...plan.fresh];
  const extra = Object.entries(progress)
    .sort(([, a], [, b]) => a.box - b.box || a.lastSeen.localeCompare(b.lastSeen))
    .map(([key]) => refOfKey(key))
    .filter((ref): ref is WordRef => !!ref && !pool.some((p) => keyOf(p) === keyOf(ref)));
  pool.push(...extra.slice(0, Math.max(0, MIN_POOL - pool.length)));

  if (pool.length && touches().length < MIN_ROUNDS) {
    steps.push({ kind: 'say', keys: ['common/lets-play-a-game'], pose: 'cheer' });
    const uses = (ref: WordRef) =>
      touches().filter((s) => s.targets.some((t) => keyOf(t) === keyOf(ref))).length;
    for (let variant = 0; touches().length < MIN_ROUNDS; variant++) {
      // Las menos usadas primero (al azar entre iguales); nunca la de la ronda anterior ni una ya agotada.
      const candidates = shuffle(pool)
        .filter((ref) => uses(ref) < MAX_ROUNDS_PER_WORD && !lastTargets().includes(keyOf(ref)))
        .sort((a, b) => uses(a) - uses(b));
      if (!candidates.length) break;
      const a = candidates[0];
      const b = candidates.slice(1).find((ref) => canPair(a, ref));
      if (b && (mode === 'pair' || (mode === 'mix' && variant % 3 === 1))) steps.push(pair(a, b));
      else steps.push(single(a, Math.max(3, countFor(a)), variant));
    }
  }
  return steps;
}

/** Todos los clips que puede necesitar la sesión, para precargarlos. */
export function audioKeys(steps: Step[]): string[] {
  return steps.flatMap((step) => {
    if (step.kind === 'say') return step.keys;
    if (step.kind === 'present') return [clipOf(step.target), `${clipOf(step.target)}-fact-1`];
    return [...step.prompt, ...step.targets.map(clipOf)];
  });
}
