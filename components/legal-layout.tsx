import Link from "next/link";

export function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen w-full bg-background">
      <div className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-border/30">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, letterSpacing: "0.05em" }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Home
        </Link>
        <span className="text-gold-gradient text-sm tracking-[0.2em] uppercase font-light">The Golden Mic</span>
        <span style={{ width: 50 }} />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 pb-24">
        <h1 className="text-gold-gradient font-light tracking-[0.06em] mb-3"
          style={{ fontSize: "clamp(1.8rem,6vw,2.6rem)" }}>{title}</h1>
        <p style={{ fontFamily: "system-ui", fontSize: 12, color: "oklch(0.45 0.03 75)", letterSpacing: "0.08em", marginBottom: 36 }}>
          Last updated: June 2026
        </p>
        {children}
      </div>
    </main>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontFamily: "system-ui", fontSize: 18, fontWeight: 700, color: "oklch(0.80 0.12 85)", marginTop: 32, marginBottom: 10, letterSpacing: "0.02em" }}>{children}</h2>;
}
export function P({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ fontFamily: "system-ui", fontSize: 14.5, color: "oklch(0.72 0.03 85)", lineHeight: 1.75, marginBottom: 12, ...style }}>{children}</p>;
}
export const ulStyle: React.CSSProperties = { fontFamily: "system-ui", fontSize: 14.5, color: "oklch(0.72 0.03 85)", lineHeight: 1.75, marginBottom: 12, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 };
export const linkStyle: React.CSSProperties = { color: "oklch(0.75 0.15 85)", textDecoration: "underline" };

export function Table({ rows }: { rows: [string, string][] }) {
  return (
    <div style={{ border: "1px solid oklch(0.28 0.03 75)", marginBottom: 16, overflow: "hidden" }}>
      {rows.map(([k, v], i) => (
        <div key={i} style={{ display: "flex", padding: "10px 14px", borderBottom: i < rows.length - 1 ? "1px solid oklch(0.22 0.02 75)" : undefined,
          background: i % 2 === 0 ? "oklch(0.11 0.01 60)" : "transparent" }}>
          <span style={{ fontFamily: "system-ui", fontSize: 13, fontWeight: 600, color: "oklch(0.65 0.05 85)", flex: "0 0 40%" }}>{k}</span>
          <span style={{ fontFamily: "system-ui", fontSize: 13, color: "oklch(0.80 0.02 85)" }}>{v}</span>
        </div>
      ))}
    </div>
  );
}
