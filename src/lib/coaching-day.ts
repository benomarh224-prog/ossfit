export const COACHING_TIME_ZONE = "Africa/Casablanca";

const calendar = new Intl.DateTimeFormat("en-CA", {
  timeZone: COACHING_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
});

function parts(date: Date) {
  const values = Object.fromEntries(calendar.formatToParts(date).map(part => [part.type, part.value]));
  return { year: Number(values.year), month: Number(values.month), day: Number(values.day), hour: Number(values.hour), minute: Number(values.minute), second: Number(values.second) };
}

export function coachingDateKey(date: Date | string) {
  const p = parts(new Date(date));
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

function midnight(year: number, month: number, day: number) {
  const target = Date.UTC(year, month - 1, day);
  let instant = target;
  for (let i = 0; i < 3; i++) {
    const p = parts(new Date(instant));
    const offset = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - instant;
    instant = target - offset;
  }
  return new Date(instant);
}

// The next local midnight may be 23 or 25 hours away when the offset changes.
export function coachingDayRange(now = new Date(), dateKey?: string) {
  const key = dateKey ?? coachingDateKey(now);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) throw new Error("Invalid date");
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.toISOString().slice(0, 10) !== key) throw new Error("Invalid date");
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  return { key, start: midnight(year, month, day), end: midnight(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate()) };
}
