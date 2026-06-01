"use client";

import { useState, useEffect } from "react";

const images = [
  {
    url: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=600&fit=crop",
    alt: "Karaoke performance"
  },
  {
    url: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&h=600&fit=crop",
    alt: "Vintage microphone setup"
  },
  {
    url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    alt: "Live music atmosphere"
  },
  {
    url: "https://images.unsplash.com/photo-1478147427282-58a87a120781?w=800&h=600&fit=crop",
    alt: "Stage performance"
  },
];

export default function PhotoCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-gold-gradient text-3xl sm:text-4xl font-light tracking-[0.1em] text-center mb-12">
        Moments
      </h2>
      
      <div className="relative aspect-[16/10] overflow-hidden">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-3 mt-8">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === current 
                ? "bg-primary w-6" 
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
