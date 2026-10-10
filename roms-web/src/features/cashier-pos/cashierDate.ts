export function getVietnamDate(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function getVietnamDateRange(date: string) {
  return {
    from: new Date(`${date}T00:00:00.000+07:00`).toISOString(),
    to: new Date(`${date}T23:59:59.999+07:00`).toISOString(),
  };
}
