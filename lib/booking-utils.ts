// Shared between API routes and the booking page

export const TIME_SLOT_HOURS: Record<string, number> = {
  "10:00 AM": 10,
  "11:00 AM": 11,
  "12:00 PM": 12,
  "1:00 PM":  13,
  "2:00 PM":  14,
  "3:00 PM":  15,
  "4:00 PM":  16,
  "5:00 PM":  17,
  "6:00 PM":  18,
  "7:00 PM":  19,
};

// How many 1-hour slots each duration blocks
export const DURATION_SLOTS: Record<string, number> = {
  "1Hr":     1,
  "2Hr":     2,
  "3Hr":     3,
  "HalfDay": 5,  // 4.5 hr → occupies slots up to +4.5, so blocks 5 hourly slots
  "FullDay": 9,  // 9 hr  → blocks 9 hourly slots
};

/** Returns every hour (as 24h integer) that the given bookings occupy */
export function occupiedHours(
  bookings: { time_slot: string; duration: string }[]
): number[] {
  const hours = new Set<number>();
  for (const b of bookings) {
    const start = TIME_SLOT_HOURS[b.time_slot];
    const count = DURATION_SLOTS[b.duration] ?? 1;
    if (start !== undefined) {
      for (let i = 0; i < count; i++) hours.add(start + i);
    }
  }
  return Array.from(hours);
}

/** True if the proposed booking conflicts with any already-occupied hour */
export function hasConflict(
  proposedSlot: string,
  proposedDuration: string,
  taken: number[]
): boolean {
  const start = TIME_SLOT_HOURS[proposedSlot];
  const count = DURATION_SLOTS[proposedDuration] ?? 1;
  if (start === undefined) return false;
  for (let i = 0; i < count; i++) {
    if (taken.includes(start + i)) return true;
  }
  return false;
}
