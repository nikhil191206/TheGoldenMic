"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import GoldenGlow from "@/components/golden-glow";

const FUNCTIONS_URL = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL as string;

export default function CancelBookingButton({
  bookingId, bookingDate, timeSlot, amountPaid,
}: {
  bookingId: string; bookingDate: string; timeSlot: string; amountPaid: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hoursUntilSlot = getHoursUntilSlot(bookingDate, timeSlot);
  const refundPct = hoursUntilSlot >= 24 ? 80 : 50;
  const refundAmount = Math.round((amountPaid * refundPct) / 100);

  async function handleCancel() {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const res = await fetch(`${FUNCTIONS_URL}/cancel-booking`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ booking_id: bookingId }),
    });

    if (!res.ok) {
      setError((await res.json()).error ?? "Cancellation failed.");
      setLoading(false);
      return;
    }

    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          fontFamily: "system-ui, sans-serif", fontSize: 12, letterSpacing: "0.08em",
          color: "oklch(0.65 0.18 25)", background: "none",
          border: "1px solid oklch(0.65 0.18 25 / 0.4)", borderRadius: 4,
          padding: "6px 14px", cursor: "pointer", textTransform: "uppercase",
        }}
      >
        Cancel Booking
      </button>

      {open && (
        <div
          onClick={() => !loading && setOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "oklch(0.13 0.01 60)", border: "1px solid oklch(0.3 0.03 75)",
              padding: 28, maxWidth: 380, width: "100%",
            }}
          >
            <h3 style={{ fontFamily: "system-ui", fontSize: 18, fontWeight: 600,
              color: "oklch(0.92 0.02 85)", marginBottom: 14 }}>
              Cancel this booking?
            </h3>
            <p style={{ fontFamily: "system-ui", fontSize: 14, color: "oklch(0.65 0.03 85)",
              lineHeight: 1.6, marginBottom: 16 }}>
              {hoursUntilSlot >= 24
                ? `Since your slot is more than 24 hours away, you're eligible for an 80% refund.`
                : `Your slot is within 24 hours, so you're eligible for a 50% refund.`}
            </p>
            <div style={{ background: "oklch(0.18 0.02 75 / 0.2)", border: "1px solid oklch(0.3 0.03 75)",
              padding: "14px 16px", marginBottom: 20 }}>
              <Row label="Amount Paid" value={`₹${amountPaid}`} />
              <Row label="Refund %" value={`${refundPct}%`} />
              <Row label="Refund Amount" value={`₹${refundAmount}`} bold />
            </div>
            {error && (
              <p style={{ fontFamily: "system-ui", fontSize: 13, color: "oklch(0.65 0.2 25)", marginBottom: 14 }}>
                {error}
              </p>
            )}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <GoldenGlow className="flex-1">
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  style={{
                    width: "100%", padding: "12px 16px", border: "1px solid oklch(0.65 0.18 25 / 0.6)",
                    background: "transparent", color: "oklch(0.70 0.18 25)",
                    fontFamily: "system-ui", fontSize: 13, letterSpacing: "0.08em",
                    textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Cancelling…" : "Yes, Cancel"}
                </button>
              </GoldenGlow>
              <GoldenGlow className="flex-1">
                <button
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  style={{
                    width: "100%", padding: "12px 16px", border: "1px solid oklch(0.3 0.03 75)",
                    background: "transparent", color: "oklch(0.65 0.03 85)",
                    fontFamily: "system-ui", fontSize: 13, letterSpacing: "0.08em",
                    textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  Keep Booking
                </button>
              </GoldenGlow>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontFamily: "system-ui", fontSize: 13, color: "oklch(0.55 0.03 75)" }}>{label}</span>
      <span style={{ fontFamily: "system-ui", fontSize: 13, fontWeight: bold ? 700 : 400,
        color: bold ? "oklch(0.75 0.15 85)" : "oklch(0.85 0.02 85)" }}>{value}</span>
    </div>
  );
}

function getHoursUntilSlot(bookingDate: string, timeSlot: string): number {
  const [time, meridiem] = timeSlot.split(" ");
  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  const slot = new Date(bookingDate + "T00:00:00");
  slot.setHours(hour, parseInt(minuteStr, 10), 0, 0);
  return (slot.getTime() - Date.now()) / (1000 * 60 * 60);
}
