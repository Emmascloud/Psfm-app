export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export type Profile = {
  id: string;
  full_name: string;
  status: "single" | "married" | null;
  birth_month: number; // 1-12
  birth_day: number; // 1-31
  anniversary_month: number | null;
  anniversary_day: number | null;
  avatar_url: string | null;
  is_admin: boolean;
  is_suspended: boolean;
  updated_at: string;
};

export type Post = {
  id: string;
  author_id: string;
  body: string;
  image_url: string | null;
  reported: boolean;
  created_at: string;
};

export type Comment = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  reported: boolean;
  created_at: string;
};

// Days from Jan 1 for a given month/day, used to place points on the wheel.
// Uses a non-leap reference year since we never store birth years.
export function dayOfYear(month: number, day: number): number {
  const cum = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  return cum[month - 1] + day;
}

export function monthName(month: number): string {
  return MONTHS[month - 1];
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Days until the next occurrence of month/day from today (0 = today).
export function daysUntil(month: number, day: number, from = new Date()): number {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let next = new Date(from.getFullYear(), month - 1, day);
  if (next < today) next = new Date(from.getFullYear() + 1, month - 1, day);
  return Math.round((next.getTime() - today.getTime()) / 86400000);
}
