import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dayRange,
  getCurrentMonth,
  getMonthRange,
  parseDateValue,
  recentMonths,
  shiftMonth,
  toDateInput,
} from '../src/utils/date.js';

test('getCurrentMonth returns a YYYY-MM key', () => {
  assert.equal(getCurrentMonth(new Date(Date.UTC(2026, 10, 6))), '2026-11');
  assert.equal(getCurrentMonth(new Date(Date.UTC(2026, 0, 1))), '2026-01');
});

test('shiftMonth handles year boundaries', () => {
  assert.equal(shiftMonth('2026-01', -1), '2025-12');
  assert.equal(shiftMonth('2026-12', 1), '2027-01');
  assert.equal(shiftMonth('2026-11', -6), '2026-05');
});

test('getMonthRange returns UTC month boundaries', () => {
  const range = getMonthRange('2026-11');
  assert.equal(range.start.toISOString(), '2026-11-01T00:00:00.000Z');
  assert.equal(range.end.toISOString(), '2026-12-01T00:00:00.000Z');
});

test('recentMonths returns an ordered six-month window', () => {
  assert.deepEqual(recentMonths('2026-11', 6), [
    '2026-06',
    '2026-07',
    '2026-08',
    '2026-09',
    '2026-10',
    '2026-11',
  ]);
});

test('date parsing preserves the calendar day using UTC noon', () => {
  const date = parseDateValue('2026-11-06');
  assert.equal(date.toISOString(), '2026-11-06T12:00:00.000Z');
  assert.equal(toDateInput(date), '2026-11-06');
});

test('dayRange covers the full selected days', () => {
  const range = dayRange('2026-11-01', '2026-11-06');
  assert.equal(range.$gte.toISOString(), '2026-11-01T00:00:00.000Z');
  assert.equal(range.$lte.toISOString(), '2026-11-06T23:59:59.999Z');
});

test('invalid months are rejected', () => {
  assert.throws(() => getMonthRange('2026-13'), /YYYY-MM/);
  assert.throws(() => shiftMonth('not-a-month', 1), /YYYY-MM/);
});
