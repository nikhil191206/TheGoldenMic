import HomeHero from "@/components/home-hero";
import PhotoCarousel from "@/components/photo-carousel";
import ContactSection from "@/components/contact-section";
import NavAuth from "@/components/nav-auth";
import PriceSheet from "@/components/price-sheet";

export default function HomePage() {
  return (
    <main className="min-h-screen w-full bg-background">
      <NavAuth />
      <HomeHero />

      <div id="pricing" className="border-t border-border/20">
        <PriceSheet />
      </div>

      <section className="py-24 px-6 border-t border-border/20">
        <PhotoCarousel />
      </section>

      <ContactSection />
    </main>
  );
}
