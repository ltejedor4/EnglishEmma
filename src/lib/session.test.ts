import { test } from 'node:test';
import assert from 'node:assert/strict';
import { topics } from '../content/index.ts';
import { keyOf, planSession, planTopicSession, recordResult, refsOf } from './review.ts';
import type { WordProgress } from './review.ts';
import { buildSteps, MAX_ROUNDS_PER_WORD, MIN_ROUNDS } from './session.ts';
import type { Step } from './session.ts';
import type { LessonMode } from './lesson.ts';

const touchTargets = (steps: Step[]) =>
  steps.flatMap((s) => (s.kind === 'touch' ? [s.targets.map(keyOf)] : []));

function assertVaried(steps: Step[], label: string) {
  const rounds = touchTargets(steps);
  for (let i = 1; i < rounds.length; i++) {
    const repeated = rounds[i].filter((k) => rounds[i - 1].includes(k));
    assert.deepEqual(repeated, [], `${label}: ${repeated} dos veces seguidas (ronda ${i})`);
  }
  const counts = new Map<string, number>();
  for (const k of rounds.flat()) counts.set(k, (counts.get(k) ?? 0) + 1);
  for (const [k, n] of counts) assert.ok(n <= MAX_ROUNDS_PER_WORD, `${label}: ${k} sale ${n} veces`);
  for (const s of steps) {
    if (s.kind !== 'touch') continue;
    for (const t of s.targets) assert.ok(s.options.some((o) => keyOf(o) === keyOf(t)), `${label}: falta la correcta`);
  }
}

test('el caso de yellow: práctica tras fallarla mezcla otras palabras', () => {
  let p: WordProgress = {};
  for (const [id, ok] of [['red', true], ['blue', true], ['yellow', false]] as const) {
    p = recordResult(p, `colors/${id}`, ok, '2026-10-03');
  }
  for (let run = 0; run < 50; run++) {
    const plan = planSession(topics, p, '2026-10-03', { maxReview: 6, maxNew: 0 });
    const steps = buildSteps(plan, p);
    const rounds = touchTargets(steps);
    assert.ok(rounds.length >= 6, `solo ${rounds.length} rondas`);
    assert.ok(new Set(rounds.flat()).size >= 3, 'al menos 3 palabras distintas');
    assert.ok(rounds.filter((r) => r.includes('colors/yellow')).length >= 2, 'yellow sale más de una vez');
    assertVaried(steps, `run ${run}`);
  }
});

test('aunque el plan traiga una sola palabra, se suman otras ya vistas', () => {
  let p: WordProgress = {};
  for (const ref of refsOf(topics[0]).slice(0, 4)) p = recordResult(p, keyOf(ref), true, '2026-10-03');
  const [yellow] = refsOf(topics[0]).filter((r) => r.word.id === 'yellow');
  const steps = buildSteps({ review: [yellow], fresh: [] }, p);
  assert.ok(new Set(touchTargets(steps).flat()).size >= 3);
  assertVaried(steps, 'una sola palabra');
});

test('200 sesiones al azar en todos los modos respetan las reglas', () => {
  const modes: LessonMode[] = ['mix', 'ask', 'fact', 'pair'];
  for (let run = 0; run < 200; run++) {
    // Progreso al azar: algunas palabras de los primeros temas, acertadas o no.
    let p: WordProgress = {};
    for (const ref of topics.slice(0, 3).flatMap(refsOf)) {
      if (Math.random() < 0.5) p = recordResult(p, keyOf(ref), Math.random() < 0.7, '2026-10-02');
    }
    const mode = modes[run % modes.length];
    const plan =
      run % 2 ? planSession(topics, p, '2026-10-03') : planTopicSession(topics[run % topics.length], p);
    const steps = buildSteps(plan, p, mode);
    assertVaried(steps, `run ${run} (${mode})`);
    if (Object.keys(p).length >= 3 || plan.fresh.length >= 3) {
      assert.ok(touchTargets(steps).length >= Math.min(MIN_ROUNDS, 6), `run ${run}: pocas rondas`);
    }
  }
});
