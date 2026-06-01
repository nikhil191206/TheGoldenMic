const rows = [
  {
    type: "Karaoke Singer",
    duration: "1 Hr",
    capacity: "1 – 5 Participants",
    charges: "₹300 / hr",
    note: "+ ₹100 per extra person",
    bulk: false,
  },
  {
    type: "Live Rehearsal",
    duration: "1 Hr",
    capacity: "1 – 3 Participants",
    charges: "₹400 / hr",
    note: "Technical assistant included",
    bulk: false,
  },
  {
    type: "Mix User",
    duration: "Half Day · 4.5 Hrs",
    capacity: "Max 6 Participants",
    charges: "₹1,200",
    note: "Per session",
    bulk: false,
  },
  {
    type: "Mix User",
    duration: "Full Day · 9 Hrs",
    capacity: "Max 6 Participants",
    charges: "₹2,400",
    note: "Per session",
    bulk: false,
  },
  {
    type: "Bulk · Karaoke",
    duration: "30 Hrs in 2 months",
    capacity: "Max 6 Participants",
    charges: "₹8,000",
    note: "11% discount · save ₹1,000",
    bulk: true,
  },
  {
    type: "Bulk · Live Rehearsal",
    duration: "30 Hrs in 2 months",
    capacity: "Max 6 Participants",
    charges: "₹10,600",
    note: "≈11% discount · save ₹1,400",
    bulk: true,
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

        {/* Desktop table */}
        <div className="hidden sm:block overflow-hidden" style={{ border: "1px solid oklch(0.25 0.03 75)" }}>
          {/* Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.6fr 1.6fr 1.4fr",
              background: "oklch(0.13 0.02 75)",
              borderBottom: "1px solid oklch(0.30 0.05 85 / 0.5)",
            }}
          >
            {["Session Type", "Duration", "Capacity", "Charges"].map((h) => (
              <div
                key={h}
                style={{
                  padding: "14px 18px",
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "oklch(0.75 0.15 85)",
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {rows.map((r, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1.6fr 1.6fr 1.4fr",
                borderBottom: i < rows.length - 1 ? "1px solid oklch(0.18 0.01 60)" : "none",
                background: r.bulk
                  ? "oklch(0.75 0.15 85 / 0.04)"
                  : i % 2 === 0
                  ? "transparent"
                  : "oklch(0.10 0.01 60)",
              }}
            >
              <div style={{ padding: "14px 18px" }}>
                <p
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: 14,
                    fontWeight: r.bulk ? 600 : 400,
                    color: r.bulk ? "oklch(0.80 0.12 85)" : "oklch(0.88 0.02 85)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {r.type}
                </p>
                {r.bulk && (
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: 4,
                      padding: "2px 8px",
                      fontSize: 10,
                      fontFamily: "system-ui",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "oklch(0.65 0.18 145)",
                      border: "1px solid oklch(0.65 0.18 145 / 0.4)",
                      background: "oklch(0.65 0.18 145 / 0.08)",
                    }}
                  >
                    Bulk Plan
                  </span>
                )}
              </div>
              <div style={{ padding: "14px 18px", fontFamily: "system-ui, sans-serif", fontSize: 13, color: "oklch(0.68 0.02 75)", letterSpacing: "0.02em", display: "flex", alignItems: "center" }}>
                {r.duration}
              </div>
              <div style={{ padding: "14px 18px", fontFamily: "system-ui, sans-serif", fontSize: 13, color: "oklch(0.68 0.02 75)", display: "flex", alignItems: "center" }}>
                {r.capacity}
              </div>
              <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 3 }}>
                <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 15, fontWeight: 700, color: "oklch(0.75 0.15 85)", letterSpacing: "0.02em" }}>
                  {r.charges}
                </p>
                <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 11, color: "oklch(0.50 0.03 75)", letterSpacing: "0.04em" }}>
                  {r.note}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden flex flex-col gap-3">
          {rows.map((r, i) => (
            <div
              key={i}
              style={{
                border: r.bulk ? "1px solid oklch(0.75 0.15 85 / 0.3)" : "1px solid oklch(0.22 0.02 75)",
                background: r.bulk ? "oklch(0.75 0.15 85 / 0.04)" : "oklch(0.10 0.01 60)",
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <p style={{ fontFamily: "system-ui", fontSize: 14, fontWeight: 600, color: r.bulk ? "oklch(0.80 0.12 85)" : "oklch(0.88 0.02 85)" }}>
                    {r.type}
                  </p>
                  <p style={{ fontFamily: "system-ui", fontSize: 12, color: "oklch(0.55 0.02 75)", marginTop: 2 }}>
                    {r.duration} · {r.capacity}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontFamily: "system-ui", fontSize: 16, fontWeight: 700, color: "oklch(0.75 0.15 85)" }}>{r.charges}</p>
                  <p style={{ fontFamily: "system-ui", fontSize: 10, color: "oklch(0.50 0.03 75)", marginTop: 2 }}>{r.note}</p>
                </div>
              </div>
              {r.bulk && (
                <span style={{ display: "inline-block", padding: "2px 8px", fontSize: 10, fontFamily: "system-ui", letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "oklch(0.65 0.18 145)", border: "1px solid oklch(0.65 0.18 145 / 0.4)", background: "oklch(0.65 0.18 145 / 0.08)" }}>
                  Bulk Plan
                </span>
              )}
            </div>
          ))}
        </div>

        <p
          className="text-center mt-8"
          style={{ fontFamily: "system-ui, sans-serif", fontSize: 12, color: "oklch(0.42 0.02 75)", letterSpacing: "0.06em" }}
        >
          Bulk plans include 11% discount on 30 hours pre-purchased over 2 months ·{" "}
          <a href="/bulk-booking" style={{ color: "oklch(0.65 0.10 85)", textDecoration: "underline" }}>
            View bulk plans
          </a>
        </p>
      </div>
    </section>
  );
}
