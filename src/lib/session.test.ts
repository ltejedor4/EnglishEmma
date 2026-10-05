import { test } from 'node:test';
import assert from 'node:assert/strict';
import { questions, topics } from '../content/index.ts';
import { keyOf, planSession, planTopicSession, recordResult, refsOf } from './review.ts';
import type { WordProgress } from './review.ts';
import { buildSteps, CLOSING_ROUNDS, GAMES, gamesFor, interactions, MAX_ROUNDS_PER_WORD, MIN_ROUNDS, questionsFor } from './session.ts';
import type { Step } from './session.ts';
import type { LessonMode } from './lesson.ts';

const [colors] = topics;

const touchTargets = (steps: Step[]) =>
  steps.flatMap((s) => (s.kind === 'touch' ? [s.targets.map(keyOf)] : []));
const gamesIn = (steps: Step[]) =>
  steps.flatMap((s) => (s.kind === 'memory' || s.kind === 'balloons' || s.kind === 'feed' ? [s.kind] : []));

function assertValid(steps: Step[], label: string) {
  const rounds = touchTargets(steps);
  for (let i = 1; i < rounds.length; i++) {
    const repeated = rounds[i].filter((k) => rounds[i - 1].includes(k));
    assert.deepEqual(repeated, [], `${label}: ${repeated} dos veces seguidas (ronda ${i})`);
  }
  const counts = new Map<string, number>();
  for (const k of rounds.flat()) counts.set(k, (counts.get(k) ?? 0) + 1);
  for (const [k, n] of counts) assert.ok(n <= MAX_ROUNDS_PER_WORD, `${label}: ${k} sale ${n} veces`);
  for (const s of steps) {
    if (s.kind === 'touch') {
      for (const t of s.targets) assert.ok(s.options.some((o) => keyOf(o) === keyOf(t)), `${label}: falta la correcta`);
    }
    if (s.kind === 'balloons' || s.kind === 'feed') {
      for (const r of s.rounds) assert.ok(r.options.some((o) => keyOf(o) === keyOf(r.target)), `${label}: ${s.kind} sin la correcta`);
      assert.equal(new Set(s.rounds.map((r) => keyOf(r.target))).size, s.rounds.length, `${label}: ${s.kind} repite objetivo`);
    }
    if (s.kind === 'memory') {
      assert.ok(s.words.length >= 2, `${label}: memory con menos de 2 pares`);
      assert.equal(new Set(s.words.map(keyOf)).size, s.words.length, `${label}: memory con pares repetidos`);
    }
  }
}

/** Segunda noche típica: 3 colores vistos ayer → 3 de repaso + 3 nuevos. */
function secondNight() {
  let p: WordProgress = {};
  for (const ref of refsOf(colors).slice(0, 3)) p = recordResult(p, keyOf(ref), true, '2026-10-03');
  return { p, plan: planSession(topics, p, '2026-10-04') };
}

// Con "Say it!": 25–36 interacciones (≈5–7 min). Sin hablar (apagado por los padres), algo menos.
test('la lección completa tiene dos juegos distintos y dura lo suficiente', () => {
  const { p, plan } = secondNight();
  for (let seed = 0; seed < 6; seed++) {
    const steps = buildSteps(plan, p, { seed });
    const games = gamesIn(steps);
    assert.equal(games.length, 2, `seed ${seed}: ${games}`);
    assert.notEqual(games[0], games[1]);
    const n = interactions(steps);
    assert.ok(n >= 25 && n <= 36, `seed ${seed}: ${n} interacciones`);
    assertValid(steps, `seed ${seed}`);
  }
});

test('los juegos rotan noche a noche y en tres noches salen los tres primero', () => {
  assert.deepEqual(gamesFor(0, false), ['memory', 'balloons']);
  assert.deepEqual(gamesFor(1, false), ['balloons', 'feed']);
  assert.deepEqual(gamesFor(2, false), ['feed', 'memory']);
  assert.deepEqual(new Set([0, 1, 2].map((s) => gamesFor(s, false)[0])), new Set(GAMES));
});

test('la práctica tiene un solo juego', () => {
  const { p, plan } = secondNight();
  const steps = buildSteps(plan, p, { seed: 4, practice: true });
  assert.equal(gamesIn(steps).length, 1);
});

test('la lección cierra con rondas de Listen & Touch después del último juego', () => {
  const { p, plan } = secondNight();
  const steps = buildSteps(plan, p, { seed: 1 });
  const lastGame = steps.findLastIndex((s) => s.kind === 'balloons' || s.kind === 'feed' || s.kind === 'memory');
  const closing = steps.slice(lastGame + 1).filter((s) => s.kind === 'touch').length;
  assert.equal(closing, CLOSING_ROUNDS);
});

test('primera noche (sin nada visto): presentación, juegos con las 3 nuevas y cierre', () => {
  const plan = planSession(topics, {}, '2026-10-03');
  const steps = buildSteps(plan, {}, { seed: 0 });
  assert.equal(steps.filter((s) => s.kind === 'present').length, 3);
  assert.equal(gamesIn(steps).length, 2);
  assertValid(steps, 'primera noche');
  assert.ok(interactions(steps) >= 20, `${interactions(steps)} interacciones`);
});

test('el caso de yellow: práctica tras fallarla mezcla otras palabras', () => {
  let p: WordProgress = {};
  for (const [id, ok] of [['red', true], ['blue', true], ['yellow', false]] as const) {
    p = recordResult(p, `colors/${id}`, ok, '2026-10-03');
  }
  for (let run = 0; run < 50; run++) {
    const plan = planSession(topics, p, '2026-10-03', { maxReview: 6, maxNew: 0 });
    for (const mode of ['ask', 'mix'] as LessonMode[]) {
      const steps = buildSteps(plan, p, { mode, practice: true, seed: run });
      assert.ok(new Set(touchTargets(steps).flat()).size >= 3, `${mode}: al menos 3 palabras distintas`);
      assertValid(steps, `run ${run} ${mode}`);
    }
    const askOnly = buildSteps(plan, p, { mode: 'ask' });
    assert.ok(touchTargets(askOnly).filter((r) => r.includes('colors/yellow')).length >= 2, 'yellow sale más de una vez');
  }
});

test('aunque el plan traiga una sola palabra, se suman otras ya vistas', () => {
  let p: WordProgress = {};
  for (const ref of refsOf(colors).slice(0, 4)) p = recordResult(p, keyOf(ref), true, '2026-10-03');
  const [yellow] = refsOf(colors).filter((r) => r.word.id === 'yellow');
  const steps = buildSteps({ review: [yellow], fresh: [] }, p, { mode: 'ask' });
  assert.ok(new Set(touchTargets(steps).flat()).size >= 3);
  assertValid(steps, 'una sola palabra');
});

test('200 lecciones al azar en todos los modos respetan las reglas', () => {
  const modes: LessonMode[] = ['mix', 'ask', 'fact', 'pair'];
  for (let run = 0; run < 200; run++) {
    // Progreso al azar: algunas palabras de los primeros temas, acertadas o no.
    let p: WordProgress = {};
    for (const ref of topics.slice(0, 3).flatMap(refsOf)) {
      if (Math.random() < 0.5) p = recordResult(p, keyOf(ref), Math.random() < 0.7, '2026-10-02');
    }
    const mode = modes[run % modes.length];
    const plan = run % 2 ? planSession(topics, p, '2026-10-03') : planTopicSession(topics[run % topics.length], p);
    const steps = buildSteps(plan, p, { mode, seed: run, practice: run % 3 === 0 });
    assertValid(steps, `run ${run} (${mode})`);
    if (mode !== 'mix' && (Object.keys(p).length >= 3 || plan.fresh.length >= 3)) {
      assert.ok(touchTargets(steps).length >= Math.min(MIN_ROUNDS, 6), `run ${run}: pocas rondas`);
    }
  }
});

test('un juego elegido en la zona de padres sale dos veces (una en la práctica)', () => {
  const { p, plan } = secondNight();
  for (const game of GAMES) {
    assert.deepEqual(gamesIn(buildSteps(plan, p, { mode: game })), [game, game]);
    assert.deepEqual(gamesIn(buildSteps(plan, p, { mode: game, practice: true })), [game]);
    assertValid(buildSteps(plan, p, { mode: game }), game);
  }
});

test('Say it! va entre los dos juegos: 3 palabras (las nuevas primero) y 1 pregunta', () => {
  const { p, plan } = secondNight();
  const steps = buildSteps(plan, p, { seed: 0 });
  const kinds = steps.map((s) => s.kind).filter((k) => ['memory', 'balloons', 'feed', 'speak'].includes(k));
  assert.deepEqual(kinds, ['memory', 'speak', 'balloons']);
  const speakStep = steps.find((s) => s.kind === 'speak');
  assert.ok(speakStep && speakStep.kind === 'speak');
  assert.deepEqual(speakStep.targets.map(keyOf), plan.fresh.map(keyOf));
  assert.equal(speakStep.questions.length, 1);
});

test('la pregunta de la lección rota noche a noche y pasan todas', () => {
  const { plan } = secondNight();
  const seen = new Set<string>();
  for (let seed = 0; seed < questions.length; seed++) {
    const [q] = questionsFor(plan, seed, false);
    seen.add(q.question.id);
  }
  assert.equal(seen.size, questions.length);
});

test('lección del tema de saludos: 3 preguntas en Say it!', () => {
  const hello = topics.find((t) => t.id === 'hello')!;
  const plan = planTopicSession(hello, {});
  const steps = buildSteps(plan, {}, { seed: 1 });
  const speakStep = steps.find((s) => s.kind === 'speak');
  assert.ok(speakStep && speakStep.kind === 'speak');
  assert.equal(speakStep.questions.length, 3);
  assert.equal(new Set(speakStep.questions.map((q) => q.question.id)).size, 3);
  assertValid(steps, 'hello');
});

test('sin hablar si los padres lo apagan; en la práctica va después del único juego', () => {
  const { p, plan } = secondNight();
  assert.equal(buildSteps(plan, p, { speak: false }).filter((s) => s.kind === 'speak').length, 0);
  const practice = buildSteps(plan, p, { practice: true, seed: 2 }).map((s) => s.kind).filter((k) => ['memory', 'balloons', 'feed', 'speak'].includes(k));
  assert.equal(practice.length, 2);
  assert.equal(practice[1], 'speak');
});

test('modo "solo hablar" de la zona de padres: 5 palabras + 3 preguntas y sin juegos', () => {
  const { p, plan } = secondNight();
  const steps = buildSteps(plan, p, { mode: 'speak' });
  assert.equal(gamesIn(steps).length, 0);
  const speakSteps = steps.filter((s) => s.kind === 'speak');
  assert.equal(speakSteps.length, 1);
  assert.ok(speakSteps[0].kind === 'speak' && speakSteps[0].targets.length === 5 && speakSteps[0].questions.length === 3);
  assertValid(steps, 'speak');
});
