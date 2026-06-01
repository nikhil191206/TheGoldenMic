"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function HomeHero() {
  const [loaded, setLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Wait 4.5 s after iframe loads so the Sketchfab hint disappears behind the screen
  const handleLoad = () => {
    setTimeout(() => setLoaded(true), 4500);
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
          style={{ fontSize: "clamp(1.6rem, 5vw, 3.5rem)", fontWeight: 300, letterSpacing: "0.22em" }}
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
            Mobile  → full-screen background, opacity 0.28 (text stays readable)
            Desktop → right-side panel, opacity 0.50                           */}
        <div
          className="absolute z-0 pointer-events-none"
          style={
            isMobile
              ? { top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%", overflow: "hidden" }
              : { right: 0, top: "50%", transform: "translateY(-50%)", width: "50%", height: "100vh", overflow: "hidden" }
          }
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
              opacity: isMobile ? 0.28 : 0.5,
            }}
            allowFullScreen
            allow="autoplay; fullscreen; xr-spatial-tracking"
            src="https://sketchfab.com/models/89810b8eda1a4a208516af74f95ffb5f/embed?autospin=1&autostart=1&preload=1&transparent=1&ui_theme=dark&ui_hint=0&ui_controls=0&ui_infos=0&ui_stop=0&ui_inspector=0&ui_watermark_link=0&ui_watermark=0&ui_annotations=0&ui_loading=0"
          />
          {/* Covers the Sketchfab bottom controls bar */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 58,
              background: "oklch(0.08 0.01 60)",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
          <h1
            className="text-gold-gradient font-light"
            style={{ fontSize: "clamp(2.4rem, 8vw, 6rem)", letterSpacing: "0.12em", lineHeight: 1.1 }}
          >
            The Golden Mic
          </h1>
          <p
            className="text-muted-foreground font-light tracking-widest"
            style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.25rem)" }}
          >
            Karaoke Studio
          </p>
          <Link
            href="/booking"
            className="mt-2 border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-500 uppercase"
            style={{ padding: "14px 36px", fontSize: "clamp(0.7rem, 2vw, 0.875rem)", letterSpacing: "0.2em" }}
          >
            Book Your Slot
          </Link>
        </div>
      </section>
    </>
  );
}
