import { test } from 'node:test';
import assert from 'node:assert/strict';
import { topics } from '../content/index.ts';
import { currentTopic, daysBetween, isLearned, keyOf, pickOptions, planSession, recordResult, refsOf } from './review.ts';
import type { WordProgress } from './review.ts';

const [colors, animals] = topics;

test('daysBetween cuenta días de calendario', () => {
  assert.equal(daysBetween('2026-10-03', '2026-10-04'), 1);
  assert.equal(daysBetween('2026-10-30', '2026-11-02'), 3);
});

test('la primera sesión trae 3 palabras nuevas de Colors y nada de repaso', () => {
  const plan = planSession(topics, {}, '2026-10-03');
  assert.equal(plan.review.length, 0);
  assert.deepEqual(plan.fresh.map((r) => r.word.id), ['red', 'blue', 'yellow']);
});

test('al día siguiente repasa las de ayer y presenta las siguientes', () => {
  let p: WordProgress = {};
  for (const ref of refsOf(colors).slice(0, 3)) p = recordResult(p, keyOf(ref), true, '2026-10-03');
  const plan = planSession(topics, p, '2026-10-04');
  assert.deepEqual(plan.review.map((r) => r.word.id), ['red', 'blue', 'yellow']);
  assert.deepEqual(plan.fresh.map((r) => r.word.id), ['green', 'pink', 'orange']);
});

test('una palabra acertada no se repasa antes de su intervalo', () => {
  let p = recordResult({}, 'colors/red', true, '2026-10-03'); // caja 1
  p = recordResult(p, 'colors/red', true, '2026-10-04'); // caja 2 → cada 2 días
  assert.equal(planSession(topics, p, '2026-10-05').review.length, 0);
  assert.equal(planSession(topics, p, '2026-10-06').review.length, 1);
});

test('un error la devuelve a la caja 0 sin borrar sus aciertos anteriores', () => {
  let p = recordResult({}, 'colors/red', true, '2026-10-03');
  p = recordResult(p, 'colors/red', false, '2026-10-04');
  assert.equal(p['colors/red'].box, 0);
  assert.deepEqual(p['colors/red'].firstTryDays, ['2026-10-03']);
});

test('jugar dos veces el mismo día no sube de caja dos veces ni cuenta dos días', () => {
  let p = recordResult({}, 'colors/red', true, '2026-10-03');
  p = recordResult(p, 'colors/red', true, '2026-10-03');
  assert.equal(p['colors/red'].box, 1);
  assert.equal(p['colors/red'].firstTryDays.length, 1);
});

test('aprendida = 3 días distintos acertando a la primera', () => {
  let p: WordProgress = {};
  for (const day of ['2026-10-03', '2026-10-04']) p = recordResult(p, 'colors/red', true, day);
  assert.equal(isLearned(p['colors/red']), false);
  p = recordResult(p, 'colors/red', true, '2026-10-06');
  assert.equal(isLearned(p['colors/red']), true);
});

test('Animals no empieza hasta tener aprendida la mitad de Colors', () => {
  let p: WordProgress = {};
  for (const ref of refsOf(colors)) p = recordResult(p, keyOf(ref), true, '2026-10-03');
  assert.equal(currentTopic(topics, p), undefined);
  for (const day of ['2026-10-04', '2026-10-05']) {
    for (const ref of refsOf(colors).slice(0, 3)) p = recordResult(p, keyOf(ref), true, day);
  }
  assert.equal(currentTopic(topics, p)?.id, animals.id);
});

test('si le cuesta, la sesión trae menos palabras nuevas', () => {
  let p: WordProgress = {};
  for (const ref of refsOf(colors).slice(0, 4)) p = recordResult(p, keyOf(ref), false, '2026-10-03');
  assert.equal(planSession(topics, p, '2026-10-04').fresh.length, 1);
});

test('sin palabras nuevas disponibles, la sesión es más repaso', () => {
  let p: WordProgress = {};
  for (const ref of refsOf(colors)) p = recordResult(p, keyOf(ref), false, '2026-10-03');
  const plan = planSession(topics, p, '2026-10-04');
  assert.equal(plan.fresh.length, 0);
  assert.equal(plan.review.length, 6);
});

test('pickOptions incluye la correcta y no repite', () => {
  const [red] = refsOf(colors);
  const options = pickOptions(red, colors, 4);
  assert.equal(options.length, 4);
  assert.ok(options.some((o) => o.word.id === 'red'));
  assert.equal(new Set(options.map((o) => o.word.id)).size, 4);
});

test('pickOptions prefiere distractores que ya conoce', () => {
  const [red] = refsOf(colors);
  for (let i = 0; i < 20; i++) {
    const options = pickOptions(red, colors, 2, new Set(['colors/red', 'colors/yellow']));
    assert.deepEqual(options.map((o) => o.word.id).sort(), ['red', 'yellow']);
  }
});
