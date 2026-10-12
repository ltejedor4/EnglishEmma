import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addDays, lastNights, puzzleFill, streak } from './nights.ts';

test('addDays cruza meses y años', () => {
  assert.equal(addDays('2026-10-31', 1), '2026-11-01');
  assert.equal(addDays('2027-01-01', -1), '2026-12-31');
});

test('la racha cuenta noches seguidas y aguanta hasta que termina el día de hoy', () => {
  const days = ['2026-10-08', '2026-10-10', '2026-10-11'];
  assert.equal(streak(days, '2026-10-11'), 2);
  assert.equal(streak(days, '2026-10-12'), 2, 'hoy todavía no jugó: sigue la de ayer');
  assert.equal(streak(days, '2026-10-13'), 0, 'se saltó una noche');
  assert.equal(streak([], '2026-10-12'), 0);
});

test('las últimas 7 noches terminan hoy', () => {
  const nights = lastNights(['2026-10-10', '2026-10-12'], '2026-10-12');
  assert.equal(nights.length, 7);
  assert.equal(nights[0].day, '2026-10-06');
  assert.deepEqual(nights.slice(-3).map((n) => n.played), [true, false, true]);
});

test('las fichas llenan los rompecabezas en orden', () => {
  assert.deepEqual(puzzleFill(0, 3, 6), [0, 0, 0]);
  assert.deepEqual(puzzleFill(8, 3, 6), [6, 2, 0]);
  assert.deepEqual(puzzleFill(40, 3, 6), [6, 6, 6]);
});
