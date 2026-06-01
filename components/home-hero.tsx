"use client";

import { useState } from "react";
import Link from "next/link";

export default function HomeHero() {
  const [loaded, setLoaded] = useState(false);

  // Sketchfab iframe fires onLoad when its HTML loads;
  // add 1.2s to let the 3D model actually begin rendering before we reveal it.
  const handleLoad = () => {
    setTimeout(() => setLoaded(true), 1200);
  };

  return (
    <>
      {/* ── Loading overlay ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          background: "oklch(0.08 0.01 60)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          transition: "opacity 1s ease",
          opacity: loaded ? 0 : 1,
          pointerEvents: loaded ? "none" : "all",
        }}
      >
        <h1
          className="text-gold-gradient"
          style={{ fontSize: "clamp(1.8rem, 5vw, 3.5rem)", fontWeight: 300, letterSpacing: "0.22em" }}
        >
          The Golden Mic
        </h1>
        <p
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 11,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "oklch(0.45 0.04 85)",
          }}
        >
          Loading…
        </p>
      </div>

      {/* ── Hero ── */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">

        {/* Sketchfab 3D mic
            - overflow:hidden clips the ~48px branding bar at the top
            - margin-top:-60px pushes it out of view
            - All UI params disabled in the URL                          */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 z-0 pointer-events-none"
          style={{ width: "50%", height: "100vh", overflow: "hidden", opacity: 0.5 }}
        >
          <iframe
            title="Vintage Golden Microphone"
            onLoad={handleLoad}
            style={{
              width: "100%",
              height: "calc(100% + 60px)",
              marginTop: "-60px",
              border: "none",
              display: "block",
            }}
            allowFullScreen
            allow="autoplay; fullscreen; xr-spatial-tracking"
            src="https://sketchfab.com/models/89810b8eda1a4a208516af74f95ffb5f/embed?autospin=1&autostart=1&preload=1&transparent=1&ui_theme=dark&ui_hint=0&ui_controls=0&ui_infos=0&ui_stop=0&ui_inspector=0&ui_watermark_link=0&ui_watermark=0&ui_annotations=0&ui_loading=0"
          />
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
    </>
  );
}
