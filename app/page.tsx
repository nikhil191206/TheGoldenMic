import Link from "next/link";
import { Mic } from "lucide-react";
import PhotoCarousel from "@/components/photo-carousel";
import ContactSection from "@/components/contact-section";

export default function HomePage() {
  return (
    <main className="min-h-screen w-full bg-background">
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Decorative background mic */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none pr-8">
          <Mic className="w-[420px] h-[420px] text-primary" strokeWidth={0.4} />
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
