function compactPhone(input: string) {
  return input.replace(/[\s\u200e\u200f\u202a-\u202e\u2066-\u2069‐‑‒–—-]/g, "");
}
export function isValidMoroccanPhone(input: string) {
  return /^(?:\+?212|0)[5-7]\d{8}$/.test(compactPhone(input));
}
export function normalizeMoroccanPhone(input: string) {
  const value = compactPhone(input);
  if (value.startsWith("+212")) return value;
  if (value.startsWith("212")) return `+${value}`;
  return value.startsWith("0") ? `+212${value.slice(1)}` : value;
}
