import { test } from 'node:test';
import assert from 'node:assert/strict';
import { topics } from '../content/index.ts';
import {
  currentTopic,
  daysBetween,
  doingWell,
  factsNaming,
  isLearned,
  keyOf,
  pickOptions,
  planSession,
  planTopicSession,
  recordResult,
  refsOf,
} from './review.ts';
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

test('Animals empieza cuando ya vio todos los colores y acierta la mayoría', () => {
  let p: WordProgress = {};
  for (const ref of refsOf(colors).slice(0, 5)) p = recordResult(p, keyOf(ref), true, '2026-10-03');
  assert.equal(currentTopic(topics, p)?.id, colors.id, 'falta ver orange');
  p = recordResult(p, 'colors/orange', true, '2026-10-03');
  assert.equal(currentTopic(topics, p)?.id, animals.id);
});

test('si vio todos los colores pero falla la mayoría, sigue repasando colores', () => {
  let p: WordProgress = {};
  for (const [i, ref] of refsOf(colors).entries()) p = recordResult(p, keyOf(ref), i < 2, '2026-10-03');
  assert.equal(currentTopic(topics, p), undefined);
});

test('no más de 6 palabras nuevas por día, sumando prácticas', () => {
  let p: WordProgress = {};
  for (const ref of refsOf(colors)) p = recordResult(p, keyOf(ref), true, '2026-10-03');
  assert.equal(planSession(topics, p, '2026-10-03').fresh.length, 0);
  assert.equal(planSession(topics, p, '2026-10-04').fresh.length, 3);
});

test('doingWell: ninguna palabra vista en la caja 0', () => {
  let p = recordResult({}, 'colors/red', true, '2026-10-03');
  assert.equal(doingWell(p), true);
  p = recordResult(p, 'colors/blue', false, '2026-10-03');
  assert.equal(doingWell(p), false);
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

test('la práctica (maxNew 0) es solo repaso, aunque le cueste', () => {
  let p: WordProgress = {};
  for (const ref of refsOf(colors).slice(0, 3)) p = recordResult(p, keyOf(ref), false, '2026-10-03');
  const plan = planSession(topics, p, '2026-10-03', { maxReview: 6, maxNew: 0 });
  assert.equal(plan.fresh.length, 0);
  assert.deepEqual(plan.review.map((r) => r.word.id).sort(), ['blue', 'red', 'yellow']);
});

test('la práctica repasa aunque nada esté pendiente hoy', () => {
  let p: WordProgress = {};
  for (const ref of refsOf(colors).slice(0, 3)) p = recordResult(p, keyOf(ref), true, '2026-10-03');
  assert.equal(planSession(topics, p, '2026-10-03', { maxReview: 6, maxNew: 0 }).review.length, 3);
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

test('factsNaming: solo frases que nombran la palabra y ninguna otra del tema', () => {
  const byId = (topicId: string, id: string) => topics.find((t) => t.id === topicId)!.words.find((w) => w.id === id)!;
  const numbers = topics.find((t) => t.id === 'numbers')!;
  assert.deepEqual(factsNaming(byId('colors', 'blue'), colors), [1, 2]);
  assert.deepEqual(factsNaming(byId('numbers', 'three'), numbers), [2]); // "Three little fish.", no "One, two, three!"
  assert.deepEqual(factsNaming(byId('numbers', 'one'), numbers), [1, 2]);
  assert.deepEqual(factsNaming(byId('feelings', 'angry'), topics.find((t) => t.id === 'feelings')!), [1]);
});

test('pickOptions con dos objetivos', () => {
  const [red, blue] = refsOf(colors);
  const options = pickOptions([red, blue], colors, 4);
  assert.equal(options.length, 4);
  assert.ok(['red', 'blue'].every((id) => options.some((o) => o.word.id === id)));
});

test('planTopicSession: lección de un tema aunque no esté desbloqueado', () => {
  const food = topics.find((t) => t.id === 'food')!;
  let plan = planTopicSession(food, {});
  assert.deepEqual(plan.fresh.map((r) => r.word.id), ['apple', 'banana', 'milk']);
  assert.equal(plan.review.length, 0);
  let p = recordResult({}, 'food/apple', true, '2026-10-03');
  p = recordResult(p, 'food/banana', false, '2026-10-03');
  plan = planTopicSession(food, p);
  assert.deepEqual(plan.review.map((r) => r.word.id), ['banana', 'apple']); // primero la que le cuesta
  assert.deepEqual(plan.fresh.map((r) => r.word.id), ['milk', 'bread', 'egg']);
});

test('práctica tras fallar yellow: el repaso no es solo yellow', () => {
  let p: WordProgress = {};
  for (const [id, ok] of [['red', true], ['blue', true], ['yellow', false]] as const) {
    p = recordResult(p, `colors/${id}`, ok, '2026-10-03');
  }
  const plan = planSession(topics, p, '2026-10-03', { maxReview: 6, maxNew: 0 });
  const ids = plan.review.map((r) => r.word.id);
  assert.equal(ids[0], 'yellow', 'la que le cuesta va primero');
  assert.deepEqual([...ids].sort(), ['blue', 'red', 'yellow']);
});
