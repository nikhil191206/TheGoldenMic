import Link from "next/link";
import PhotoCarousel from "@/components/photo-carousel";
import ContactSection from "@/components/contact-section";

export default function HomePage() {
  return (
    <main className="min-h-screen w-full bg-background">
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Sketchfab 3D mic — top bar clipped via overflow hidden + negative margin */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 z-0 pointer-events-none"
          style={{ width: "50%", height: "100vh", overflow: "hidden", opacity: 0.45 }}
        >
          <iframe
            title="Vintage Golden Microphone"
            style={{ width: "100%", height: "calc(100% + 60px)", marginTop: "-60px", border: "none" }}
            allowFullScreen
            allow="autoplay; fullscreen; xr-spatial-tracking"
            src="https://sketchfab.com/models/89810b8eda1a4a208516af74f95ffb5f/embed?autospin=1&autostart=1&preload=1&transparent=1&ui_theme=dark&ui_hint=0&ui_controls=0&ui_infos=0&ui_stop=0&ui_inspector=0&ui_watermark_link=0&ui_watermark=0&ui_annotations=0"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-10 px-6 text-center">
          <h1 className="text-gold-gradient text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-[0.15em]">
            The Golden Mic
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl font-light tracking-widest">
            Karaoke Studio
          </p>
          <Link
            href="/booking"
            className="mt-4 px-10 py-4 border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-500 tracking-[0.2em] text-sm uppercase"
          >
            Book Your Slot
          </Link>
        </div>
      </section>

      <section className="py-24 px-6">
        <PhotoCarousel />
      </section>

      <ContactSection />
    </main>
  );
}
