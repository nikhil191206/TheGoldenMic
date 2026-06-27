import { Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

export default function ContactSection() {
  return (
    <section className="py-24 px-6 border-t border-border/30">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-gold-gradient text-3xl sm:text-4xl font-light tracking-[0.1em] mb-16">
          Get In Touch
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <a href="tel:+919422789659" style={linkStyle}>
            <Phone style={iconStyle} />
            <span style={textStyle}>+91 94227 89659</span>
          </a>

          <a href="mailto:thegoldenmicpune@gmail.com" style={linkStyle}>
            <Mail style={iconStyle} />
            <span style={textStyle}>thegoldenmicpune@gmail.com</span>
          </a>

          <div style={{ ...linkStyle, cursor: "default", alignItems: "flex-start" }}>
            <MapPin style={{ ...iconStyle, marginTop: 2 }} />
            <span style={{ ...textStyle, textAlign: "left", lineHeight: 1.7 }}>
              401, Vidydhar Heights, 243 Narayan Peth,<br />
              Laxmi Road, Pune – 411030
            </span>
          </div>
        </div>

        {/* Google Maps embed */}
        <div
          style={{
            marginTop: 40,
            border: "1px solid oklch(0.75 0.15 85 / 0.3)",
            overflow: "hidden",
            lineHeight: 0,
          }}
        >
          <iframe
            title="The Golden Mic – Location"
            src="https://maps.google.com/maps?q=18.513641,73.845489&z=18&output=embed"
            width="100%"
            height="300"
            style={{ border: 0, display: "block", filter: "invert(90%) hue-rotate(180deg)" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <a
          href="https://maps.google.com/?q=18.513641,73.845489"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            marginTop: 12,
            fontFamily: "system-ui, sans-serif",
            fontSize: 12,
            color: "oklch(0.65 0.10 85)",
            letterSpacing: "0.06em",
            textDecoration: "none",
          }}
        >
          Open in Google Maps ↗
        </a>

        {/* Legal links */}
        <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap", marginTop: 32 }}>
          {[
            ["Terms & Conditions", "/terms"],
            ["Privacy Policy", "/privacy"],
            ["Refund Policy", "/refund-policy"],
          ].map(([label, href]) => (
            <Link key={href} href={href} style={{
              fontFamily: "system-ui, sans-serif", fontSize: 12, letterSpacing: "0.08em",
              color: "oklch(0.50 0.03 75)", textDecoration: "none",
            }}>{label}</Link>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: 40, height: 1, background: "oklch(0.75 0.15 85 / 0.3)", margin: "32px auto" }} />

        <p
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 11,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "oklch(0.40 0.02 85)",
          }}
        >
          © 2026 The Golden Mic Studio
        </p>
      </div>
    </section>
  );
}

const linkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 16,
  textDecoration: "none",
  color: "oklch(0.72 0.03 85)",
  transition: "color 0.3s",
};

const textStyle: React.CSSProperties = {
  fontFamily: "system-ui, sans-serif",
  fontSize: 17,
  letterSpacing: "0.06em",
};

const iconStyle: React.CSSProperties = {
  color: "oklch(0.75 0.15 85)",
  flexShrink: 0,
  width: 22,
  height: 22,
};
