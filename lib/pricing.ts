export const DURATION_HOURS: Record<string, number> = {
  "1Hr": 1, "2Hr": 2, "3Hr": 3, "HalfDay": 4.5, "FullDay": 9,
};

export const BOOKING_TYPES = [
  {
    value: "karaoke_singer",
    label: "Karaoke Singer",
    sublabel: "Solo / Duet",
    rate: "₹300/hr + ₹100/extra person",
    maxPeople: 5,
    mixOnly: false,
    info: "Solo or Duet Singing on Karaoke track on full system, without technical assistant.",
  },
  {
    value: "live_rehearsal",
    label: "Live Rehearsal",
    sublabel: "Up to 3 participants",
    rate: "₹400/hr",
    maxPeople: 3,
    mixOnly: false,
    info: "A practice session in real-time with full system on 4 mic combination of Singer & instrument players, supported by a technical assistant.",
  },
  {
    value: "mix_user",
    label: "Mix User",
    sublabel: "Half Day / Full Day only",
    rate: "₹1,200 (Half Day) · ₹2,400 (Full Day)",
    maxPeople: 6,
    mixOnly: true,
    info: "A Karaoke group or small group of instrument players or a combination of both. Applicable for Half Day or Full Day sessions only, without technical assistant.",
  },
] as const;

export interface PriceBreakdown {
  lines: { label: string; amount: number }[];
  total: number;
}

export function calculatePrice(
  bookingType: string,
  duration: string,
  peopleCount: number
): PriceBreakdown {
  const hours = DURATION_HOURS[duration] ?? 1;
  const people = Math.max(1, peopleCount || 1);

  if (bookingType === "karaoke_singer") {
    const base = 300 * hours;
    const extras = Math.max(0, people - 1);
    const lines = [{ label: `Base · ₹300/hr × ${hours}hr`, amount: base }];
    if (extras > 0) {
      lines.push({ label: `${extras} extra person${extras > 1 ? "s" : ""} · ₹100/hr × ${hours}hr`, amount: extras * 100 * hours });
    }
    return { lines, total: lines.reduce((s, l) => s + l.amount, 0) };
  }

  if (bookingType === "live_rehearsal") {
    const total = 400 * hours;
    return { lines: [{ label: `₹400/hr × ${hours}hr`, amount: total }], total };
  }

  if (bookingType === "mix_user") {
    const total = duration === "HalfDay" ? 1200 : 2400;
    return { lines: [{ label: duration === "HalfDay" ? "Half Day session (4.5 hrs)" : "Full Day session (9 hrs)", amount: total }], total };
  }

  return { lines: [], total: 0 };
}

export function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export const BULK_PLANS = [
  {
    value: "karaoke_singer",
    label: "Bulk · Karaoke Singer",
    hours: 30,
    months: 2,
    maxPeople: 6,
    basePrice: 9000,
    discountedPrice: 8000,
    saving: 1000,
    discount: "11%",
  },
  {
    value: "live_rehearsal",
    label: "Bulk · Live Rehearsal",
    hours: 30,
    months: 2,
    maxPeople: 6,
    basePrice: 12000,
    discountedPrice: 10600,
    saving: 1400,
    discount: "≈11%",
  },
] as const;
