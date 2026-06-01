import HomeHero from "@/components/home-hero";
import PhotoCarousel from "@/components/photo-carousel";
import ContactSection from "@/components/contact-section";

export default function HomePage() {
  return (
    <main className="min-h-screen w-full bg-background">
      <HomeHero />

      <section className="py-24 px-6">
        <PhotoCarousel />
      </section>

      <ContactSection />
    </main>
  );
}
