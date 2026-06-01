import Link from "next/link";
import MicWrapper from "@/components/mic-wrapper";
import PhotoCarousel from "@/components/photo-carousel";
import ContactSection from "@/components/contact-section";

export default function HomePage() {
  return (
    <main className="min-h-screen w-full bg-background">
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Three.js golden mic — rendered natively, no external embed */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 z-0 pointer-events-none"
          style={{ width: "52%", height: "110vh", opacity: 0.55 }}
        >
          <MicWrapper />
        </div>

        {/* Content */}
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
