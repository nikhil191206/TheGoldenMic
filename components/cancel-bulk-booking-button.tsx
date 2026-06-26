"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

const FUNCTIONS_URL = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL as string;

export default function CancelBulkBookingButton({
  bulkBookingId, startDate, amountPaid, usedHours,
}: {
  bulkBookingId: string; startDate: string; amountPaid: number; usedHours: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hoursUntilStart = (new Date(startDate + "T00:00:00").getTime() - Date.now()) / (1000 * 60 * 60);
  const refundPct = hoursUntilStart >= 24 ? 80 : 50;
  const refundAmount = Math.round((amountPaid * refundPct) / 100);
  const alreadyUsed = usedHours > 0;

  async function handleCancel() {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const res = await fetch(`${FUNCTIONS_URL}/cancel-bulk-booking`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ bulk_booking_id: bulkBookingId }),
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
        Cancel Plan
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
              Cancel this bulk plan?
            </h3>

            {alreadyUsed ? (
              <p style={{ fontFamily: "system-ui", fontSize: 14, color: "oklch(0.65 0.2 25)",
                lineHeight: 1.6, marginBottom: 16 }}>
                You&apos;ve already used {usedHours} hour{usedHours === 1 ? "" : "s"} from this plan, so it can&apos;t be
                self-cancelled. Please contact us directly at thegoldenmicpune@gmail.com or +91 94227 89659.
              </p>
            ) : (
              <>
                <p style={{ fontFamily: "system-ui", fontSize: 14, color: "oklch(0.65 0.03 85)",
                  lineHeight: 1.6, marginBottom: 16 }}>
                  {hoursUntilStart >= 24
                    ? `Since your plan's start date is more than 24 hours away, you're eligible for an 80% refund.`
                    : `Your plan's start date is within 24 hours, so you're eligible for a 50% refund.`}
                </p>
                <div style={{ background: "oklch(0.18 0.02 75 / 0.2)", border: "1px solid oklch(0.3 0.03 75)",
                  padding: "14px 16px", marginBottom: 20 }}>
                  <Row label="Amount Paid" value={`₹${amountPaid}`} />
                  <Row label="Refund %" value={`${refundPct}%`} />
                  <Row label="Refund Amount" value={`₹${refundAmount}`} bold />
                </div>
              </>
            )}

            {error && (
              <p style={{ fontFamily: "system-ui", fontSize: 13, color: "oklch(0.65 0.2 25)", marginBottom: 14 }}>
                {error}
              </p>
            )}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {!alreadyUsed && (
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  style={{
                    flex: 1, padding: "12px 16px", border: "1px solid oklch(0.65 0.18 25 / 0.6)",
                    background: "transparent", color: "oklch(0.70 0.18 25)",
                    fontFamily: "system-ui", fontSize: 13, letterSpacing: "0.08em",
                    textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Cancelling…" : "Yes, Cancel"}
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                style={{
                  flex: 1, padding: "12px 16px", border: "1px solid oklch(0.3 0.03 75)",
                  background: "transparent", color: "oklch(0.65 0.03 85)",
                  fontFamily: "system-ui", fontSize: 13, letterSpacing: "0.08em",
                  textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {alreadyUsed ? "Close" : "Keep Plan"}
              </button>
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
