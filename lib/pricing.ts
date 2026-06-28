export const DURATION_HOURS: Record<string, number> = {
  "1Hr": 1, "2Hr": 2, "3Hr": 3, "HalfDay": 4.5, "FullDay": 9,
};

export const BOOKING_TYPES = [
  {
    value: "karaoke_singer",
    label: "Karaoke Singer",
    sublabel: "Solo / Group",
    rate: "₹300/hr (flat)",
    maxPeople: 50,
    mixOnly: false,
    info: "Solo or Group Singing on Karaoke track on full system, without technical assistant.",
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
  subtotal: number;
  fee: number;
  total: number;
}

// Razorpay's processing fee, passed on to the customer per the published
// Terms & Refund Policy — non-refundable, charged on top of the base price.
export const TRANSACTION_FEE_RATE = 0.02;

function withFee(lines: { label: string; amount: number }[], subtotal: number): PriceBreakdown {
  const fee = Math.round(subtotal * TRANSACTION_FEE_RATE);
  return {
    lines: [...lines, { label: "Payment processing fee (2%)", amount: fee }],
    subtotal,
    fee,
    total: subtotal + fee,
  };
}

export function calculatePrice(
  bookingType: string,
  duration: string,
  peopleCount: number
): PriceBreakdown {
  const hours = DURATION_HOURS[duration] ?? 1;
  const people = Math.max(1, peopleCount || 1);

  if (bookingType === "karaoke_singer") {
    const subtotal = 300 * hours;
    return withFee([{ label: `₹300/hr × ${hours}hr (flat rate)`, amount: subtotal }], subtotal);
  }

  if (bookingType === "live_rehearsal") {
    const subtotal = 400 * hours;
    return withFee([{ label: `₹400/hr × ${hours}hr`, amount: subtotal }], subtotal);
  }

  if (bookingType === "mix_user") {
    const subtotal = duration === "HalfDay" ? 1200 : 2400;
    return withFee([{ label: duration === "HalfDay" ? "Half Day session (4.5 hrs)" : "Full Day session (9 hrs)", amount: subtotal }], subtotal);
  }

  return { lines: [], subtotal: 0, fee: 0, total: 0 };
}

export function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

// For flat-priced flows (bulk plans) that don't go through calculatePrice.
export function applyTransactionFee(subtotal: number): { fee: number; total: number } {
  const fee = Math.round(subtotal * TRANSACTION_FEE_RATE);
  return { fee, total: subtotal + fee };
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
