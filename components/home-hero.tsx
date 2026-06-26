"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import GoldenGlow from "@/components/golden-glow";
import LiquidEther from "@/components/LiquidEther";
import ShinyText from "@/components/ShinyText";

export default function HomeHero() {
  const [loaded, setLoaded]       = useState(false);
  const [isMobile, setIsMobile]   = useState(false);
  const [soundOn, setSoundOn]     = useState(false);   // user has enabled sound
  const audioRef                  = useRef<HTMLAudioElement>(null);

  /* ── Viewport detection ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── Attempt autoplay when component mounts ── */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.6;
    audio.play()
      .then(() => setSoundOn(true))
      .catch(() => setSoundOn(false)); // browser blocked autoplay — button still lets user start it
  }, []);

  /* ── Toggle play / pause via the speaker button ── */
  const toggleSound = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.volume = 0.6;
      audio.play().then(() => setSoundOn(true));
    } else {
      audio.pause();
      setSoundOn(false);
    }
  };

  const handleLoad = () => {
    setTimeout(() => setLoaded(true), 2500);
  };

  /* ── Safety net: never get stuck on the loading screen if the 3D embed fails to load ── */
  useEffect(() => {
    const fallback = setTimeout(() => setLoaded(true), 6000);
    return () => clearTimeout(fallback);
  }, []);

  return (
    <>
      {/* Hidden audio element — loops the background music */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src="/bg-music.mpeg" loop preload="auto" />

      {/* ── Loading overlay ── */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "oklch(0.08 0.01 60)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20,
          transition: "opacity 1s ease",
          opacity: loaded ? 0 : 1,
          pointerEvents: loaded ? "none" : "all",
        }}
      >
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <LiquidEther
            colors={["#D4AF37", "#F5D27A", "#8B6210"]}
            resolution={0.4}
            mouseForce={10}
            cursorSize={70}
            autoDemo
            autoSpeed={0.3}
            autoIntensity={1}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <h1
          style={{ position: "relative", zIndex: 1, fontSize: "clamp(1.6rem, 5vw, 3.5rem)", fontWeight: 300, letterSpacing: "0.22em" }}
        >
          <ShinyText text="The Golden Mic" color="#d4af37" shineColor="#fff6d8" speed={3} spread={120} />
        </h1>
        <p style={{ position: "relative", zIndex: 1, fontFamily: "system-ui, sans-serif", fontSize: 11, letterSpacing: "0.3em",
          textTransform: "uppercase", color: "oklch(0.45 0.04 85)" }}>
          Loading…
        </p>
      </div>

      {/* ── Persistent speaker toggle — bottom-right corner ── */}
      <style>{`
        @keyframes soundPulse {
          0%   { box-shadow: 0 0 0 0 oklch(0.75 0.15 85 / 0.45); }
          70%  { box-shadow: 0 0 0 12px oklch(0.75 0.15 85 / 0); }
          100% { box-shadow: 0 0 0 0 oklch(0.75 0.15 85 / 0); }
        }
      `}</style>
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 110, display: "flex", alignItems: "center", gap: 10 }}>
        {loaded && !soundOn && (
          <span style={{
            fontFamily: "system-ui, sans-serif", fontSize: 11, letterSpacing: "0.08em",
            color: "oklch(0.75 0.15 85)", background: "oklch(0.13 0.01 60 / 0.85)",
            padding: "6px 10px", borderRadius: 6, border: "1px solid oklch(0.75 0.15 85 / 0.3)",
            backdropFilter: "blur(6px)", whiteSpace: "nowrap",
          }}>
            Tap for sound
          </span>
        )}
        <button
          onClick={toggleSound}
          aria-label={soundOn ? "Mute music" : "Play music"}
          style={{
            width: 46, height: 46, borderRadius: "50%",
            background: "oklch(0.13 0.01 60 / 0.85)",
            border: "1px solid oklch(0.75 0.15 85 / 0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", backdropFilter: "blur(6px)",
            color: "oklch(0.75 0.15 85)", transition: "all 0.3s",
            animation: !soundOn ? "soundPulse 2s infinite" : undefined,
          }}
        >
          {soundOn ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          )}
        </button>
      </div>

      {/* ── Hero ── */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ opacity: 0.6 }}>
          <LiquidEther
            colors={["#D4AF37", "#F5D27A", "#8B6210"]}
            resolution={isMobile ? 0.3 : 0.5}
            mouseForce={10}
            cursorSize={70}
            autoDemo
            autoSpeed={0.3}
            autoIntensity={1}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
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
              width: "100%", height: "calc(100% + 100px)", marginTop: "-100px",
              border: "none", display: "block",
              opacity: isMobile ? 0.28 : 0.5,
              pointerEvents: "none",
            }}
            allowFullScreen
            allow="autoplay; fullscreen; xr-spatial-tracking"
            src="https://sketchfab.com/models/89810b8eda1a4a208516af74f95ffb5f/embed?autostart=1&autospin=1&ui_hint=0&transparent=1&ui_theme=dark&ui_controls=0"
          />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 28,
            background: "linear-gradient(to bottom, transparent, oklch(0.08 0.01 60))" }} />
          {/* Mask the Sketchfab logo/branding badge (bottom-left, fixed by their embed, can't be disabled via URL params) */}
          <div style={{ position: "absolute", bottom: 0, left: 0, width: 64, height: 64,
            background: "oklch(0.08 0.01 60)" }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
          <h1 className="font-light"
            style={{ fontSize: "clamp(3.5rem, 14vw, 10rem)", letterSpacing: "0.08em", lineHeight: 1.05 }}>
            <ShinyText text="The Golden Mic" color="#d4af37" shineColor="#fff6d8" speed={3} spread={120} />
          </h1>
          <p className="text-muted-foreground font-light tracking-[0.35em] uppercase"
            style={{ fontSize: "clamp(0.7rem, 2vw, 1rem)" }}>
            Karaoke Studio
          </p>
          <GoldenGlow>
            <Link href="/booking"
              className="mt-4 border border-primary/50 text-primary transition-all duration-500 uppercase"
              style={{ padding: "14px 40px", fontSize: "clamp(0.65rem, 1.8vw, 0.8rem)", letterSpacing: "0.25em", display: "inline-block" }}>
              Book Your Slot
            </Link>
          </GoldenGlow>
          <button
            onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            className="text-muted-foreground hover:text-primary transition-colors uppercase"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "clamp(0.6rem, 1.6vw, 0.75rem)", letterSpacing: "0.2em", padding: "4px 0" }}>
            View Cost Sheet ↓
          </button>
        </div>
      </section>
    </>
  );
}
