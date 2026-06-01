import { Mail, Phone, MapPin, Instagram, Music2 } from "lucide-react";

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

export default function ContactSection() {
  return (
    <section className="py-24 px-6 border-t border-border/30">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-gold-gradient text-3xl sm:text-4xl font-light tracking-[0.1em] mb-16">
          Get In Touch
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <a href="tel:+1234567890" style={linkStyle}>
            <Phone style={iconStyle} />
            <span style={textStyle}>+1 (234) 567-890</span>
          </a>

          <a href="mailto:hello@goldenmicstudio.com" style={linkStyle}>
            <Mail style={iconStyle} />
            <span style={textStyle}>hello@goldenmicstudio.com</span>
          </a>

          <div style={{ ...linkStyle, cursor: "default" }}>
            <MapPin style={iconStyle} />
            <span style={textStyle}>123 Music Lane, Downtown</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 40, height: 1, background: "oklch(0.75 0.15 85 / 0.3)", margin: "48px auto" }} />

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
