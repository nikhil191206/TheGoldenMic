import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactSection() {
  return (
    <section className="py-24 px-6 border-t border-border/30">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-gold-gradient text-3xl sm:text-4xl font-light tracking-[0.1em] mb-16">
          Contact
        </h2>

        <div className="flex flex-col gap-8">
          <a
            href="tel:+1234567890"
            className="group flex items-center justify-center gap-4 text-muted-foreground hover:text-primary transition-colors duration-300"
          >
            <Phone className="w-5 h-5" />
            <span className="tracking-widest text-sm">+1 (234) 567-890</span>
          </a>

          <a
            href="mailto:hello@goldenmicstudio.com"
            className="group flex items-center justify-center gap-4 text-muted-foreground hover:text-primary transition-colors duration-300"
          >
            <Mail className="w-5 h-5" />
            <span className="tracking-widest text-sm">hello@goldenmicstudio.com</span>
          </a>

          <div className="flex items-center justify-center gap-4 text-muted-foreground">
            <MapPin className="w-5 h-5" />
            <span className="tracking-widest text-sm">123 Music Lane, Downtown</span>
          </div>
        </div>

        <p className="mt-20 text-muted-foreground/50 text-xs tracking-[0.2em] uppercase">
          The Golden Mic Studio
        </p>
      </div>
    </section>
  );
}
