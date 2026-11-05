export const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export function getCurrentMonth(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function assertMonth(month) {
  if (!MONTH_REGEX.test(month)) {
    const error = new Error('Month must use YYYY-MM format.');
    error.statusCode = 400;
    throw error;
  }
  return month;
}

export function getMonthRange(month) {
  assertMonth(month);
  const [year, monthNumber] = month.split('-').map(Number);
  return {
    start: new Date(Date.UTC(year, monthNumber - 1, 1)),
    end: new Date(Date.UTC(year, monthNumber, 1)),
  };
}

export function shiftMonth(month, offset) {
  assertMonth(month);
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + offset, 1));
  return getCurrentMonth(date);
}

export function recentMonths(month, count) {
  const months = [];
  for (let index = count - 1; index >= 0; index -= 1) {
    months.push(shiftMonth(month, -index));
  }
  return months;
}

export function parseDateValue(value) {
  const date = new Date(`${value}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    const error = new Error('Please provide a valid date.');
    error.statusCode = 400;
    throw error;
  }
  return date;
}

export function dayRange(startDate, endDate) {
  const range = {};
  if (startDate) range.$gte = new Date(`${startDate}T00:00:00.000Z`);
  if (endDate) range.$lte = new Date(`${endDate}T23:59:59.999Z`);
  return range;
}

export function toDateInput(date) {
  return new Date(date).toISOString().slice(0, 10);
}
