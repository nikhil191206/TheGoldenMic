"use client";

import Link from "next/link";

const rows = [
  {
    type: "Karaoke Singer",
    duration: "1 Hr",
    capacity: "Any group size",
    charges: "₹300 / hr",
    note: "Flat rate · no per-person charge",
    bulk: false,
    description: "Solo or Group Singing on Karaoke track on full system, without technical assistant. Fixed rate regardless of group size.",
    href: "/booking?type=karaoke_singer",
  },
  {
    type: "Live Rehearsal",
    duration: "1 Hr",
    capacity: "1 – 3 Participants",
    charges: "₹400 / hr",
    note: "Technical assistant included",
    bulk: false,
    description: "Practice session in real-time with full system on a 4-mic combination of Singers & instrument players, supported by a technical assistant.",
    href: "/booking?type=live_rehearsal",
  },
  {
    type: "Mix User",
    duration: "Half Day · 4.5 Hrs",
    capacity: "Max 6 Participants",
    charges: "₹1,200",
    note: "Per session",
    bulk: false,
    description: "A Karaoke group or small group of instrument players or a combination of both. Half Day or Full Day sessions only, without technical assistant.",
    href: "/booking?type=mix_user",
  },
  {
    type: "Mix User",
    duration: "Full Day · 9 Hrs",
    capacity: "Max 6 Participants",
    charges: "₹2,400",
    note: "Per session",
    bulk: false,
    description: null,
    href: "/booking?type=mix_user",
  },
  {
    type: "Bulk · Karaoke Singer",
    duration: "30 Hrs in 2 months",
    capacity: "Max 6 Participants",
    charges: "₹8,000",
    note: "11% discount · save ₹1,000",
    bulk: true,
    description: "Pre-purchase 30 hours of Karaoke Singer sessions. Book any day within your 2-month window — no payment per session.",
    href: "/bulk-booking?plan=karaoke_singer",
  },
  {
    type: "Bulk · Live Rehearsal",
    duration: "30 Hrs in 2 months",
    capacity: "Max 6 Participants",
    charges: "₹10,600",
    note: "≈11% discount · save ₹1,400",
    bulk: true,
    description: "Pre-purchase 30 hours of Live Rehearsal sessions. Book any day within your 2-month window — no payment per session.",
    href: "/bulk-booking?plan=live_rehearsal",
  },
];

export default function PriceSheet() {
  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-gold-gradient text-3xl sm:text-4xl font-light tracking-[0.1em] text-center mb-3">
          Pricing
        </h2>
        <p
          className="text-center text-muted-foreground mb-12"
          style={{ fontFamily: "system-ui, sans-serif", fontSize: 14, letterSpacing: "0.08em" }}
        >
          Transparent rates · No hidden charges
        </p>

        {/* ── Desktop table ── */}
        <div className="hidden sm:block overflow-hidden" style={{ border: "1px solid oklch(0.25 0.03 75)" }}>
          {/* Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2.4fr 1.4fr 1.4fr 1.3fr",
              background: "oklch(0.13 0.02 75)",
              borderBottom: "1px solid oklch(0.30 0.05 85 / 0.5)",
            }}
          >
            {["Session Type & Info", "Duration", "Capacity", "Charges"].map((h) => (
              <div key={h} style={{ padding: "13px 18px", fontFamily: "system-ui, sans-serif",
                fontSize: 11, fontWeight: 600, letterSpacing: "0.18em",
                textTransform: "uppercase", color: "oklch(0.75 0.15 85)" }}>
                {h}
              </div>
            ))}
          </div>

          {rows.map((r, i) => (
            <Link key={i} href={r.href} style={{
              display: "grid",
              gridTemplateColumns: "2.4fr 1.4fr 1.4fr 1.3fr",
              borderBottom: i < rows.length - 1 ? "1px solid oklch(0.18 0.01 60)" : "none",
              background: r.bulk
                ? "oklch(0.75 0.15 85 / 0.04)"
                : i % 2 === 0 ? "transparent" : "oklch(0.10 0.01 60)",
              textDecoration: "none",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "oklch(0.75 0.15 85 / 0.07)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = r.bulk ? "oklch(0.75 0.15 85 / 0.04)" : i % 2 === 0 ? "transparent" : "oklch(0.10 0.01 60)"}
            >
              {/* Type + description */}
              <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 14,
                    fontWeight: r.bulk ? 600 : 500,
                    color: r.bulk ? "oklch(0.80 0.12 85)" : "oklch(0.88 0.02 85)",
                    letterSpacing: "0.02em" }}>
                    {r.type}
                  </p>
                  {r.bulk && (
                    <span style={{ padding: "2px 7px", fontSize: 9, fontFamily: "system-ui",
                      letterSpacing: "0.12em", textTransform: "uppercase",
                      color: "oklch(0.65 0.18 145)", border: "1px solid oklch(0.65 0.18 145 / 0.4)",
                      background: "oklch(0.65 0.18 145 / 0.08)", whiteSpace: "nowrap" }}>
                      Bulk Plan
                    </span>
                  )}
                </div>
                {r.description && (
                  <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 12,
                    color: "oklch(0.52 0.02 75)", lineHeight: 1.55, letterSpacing: "0.02em" }}>
                    {r.description}
                  </p>
                )}
              </div>

              {/* Duration */}
              <div style={{ padding: "14px 18px", fontFamily: "system-ui, sans-serif",
                fontSize: 13, color: "oklch(0.68 0.02 75)", display: "flex", alignItems: "flex-start", paddingTop: 16 }}>
                {r.duration}
              </div>

              {/* Capacity */}
              <div style={{ padding: "14px 18px", fontFamily: "system-ui, sans-serif",
                fontSize: 13, color: "oklch(0.68 0.02 75)", display: "flex", alignItems: "flex-start", paddingTop: 16 }}>
                {r.capacity}
              </div>

              {/* Charges */}
              <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column",
                justifyContent: "flex-start", gap: 4, paddingTop: 16 }}>
                <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 15, fontWeight: 700,
                  color: "oklch(0.75 0.15 85)", letterSpacing: "0.02em" }}>
                  {r.charges}
                </p>
                <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 11,
                  color: r.bulk ? "oklch(0.60 0.12 145)" : "oklch(0.50 0.03 75)", letterSpacing: "0.03em" }}>
                  {r.note}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Mobile cards ── */}
        <div className="sm:hidden flex flex-col gap-3">
          {rows.map((r, i) => (
            <Link key={i} href={r.href} style={{
              border: r.bulk ? "1px solid oklch(0.75 0.15 85 / 0.3)" : "1px solid oklch(0.22 0.02 75)",
              background: r.bulk ? "oklch(0.75 0.15 85 / 0.04)" : "oklch(0.10 0.01 60)",
              padding: "16px",
              display: "block",
              textDecoration: "none",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: r.description ? 10 : 0 }}>
                <div style={{ flex: 1, paddingRight: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 }}>
                    <p style={{ fontFamily: "system-ui", fontSize: 14, fontWeight: 600,
                      color: r.bulk ? "oklch(0.80 0.12 85)" : "oklch(0.88 0.02 85)" }}>
                      {r.type}
                    </p>
                    {r.bulk && (
                      <span style={{ padding: "2px 7px", fontSize: 9, fontFamily: "system-ui",
                        letterSpacing: "0.12em", textTransform: "uppercase",
                        color: "oklch(0.65 0.18 145)", border: "1px solid oklch(0.65 0.18 145 / 0.4)",
                        background: "oklch(0.65 0.18 145 / 0.08)" }}>
                        Bulk
                      </span>
                    )}
                  </div>
                  <p style={{ fontFamily: "system-ui", fontSize: 12, color: "oklch(0.50 0.02 75)" }}>
                    {r.duration} · {r.capacity}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontFamily: "system-ui", fontSize: 16, fontWeight: 700, color: "oklch(0.75 0.15 85)" }}>{r.charges}</p>
                  <p style={{ fontFamily: "system-ui", fontSize: 10, color: r.bulk ? "oklch(0.60 0.12 145)" : "oklch(0.50 0.03 75)", marginTop: 2 }}>{r.note}</p>
                </div>
              </div>
              {r.description && (
                <p style={{ fontFamily: "system-ui", fontSize: 12, color: "oklch(0.50 0.02 75)",
                  lineHeight: 1.55, borderTop: "1px solid oklch(0.18 0.01 60)", paddingTop: 10 }}>
                  {r.description}
                </p>
              )}
            </Link>
          ))}
        </div>

        <p className="text-center mt-8"
          style={{ fontFamily: "system-ui, sans-serif", fontSize: 12, color: "oklch(0.42 0.02 75)", letterSpacing: "0.06em" }}>
          Bulk plans include discount on 30 hours pre-purchased over 2 months ·{" "}
          <a href="/bulk-booking" style={{ color: "oklch(0.65 0.10 85)", textDecoration: "underline" }}>
            View bulk plans →
          </a>
        </p>
      </div>
    </section>
  );
}
