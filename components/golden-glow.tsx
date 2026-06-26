"use client";

import { useCallback, useEffect, useRef } from "react";
import "./golden-glow.css";

export default function GoldenGlow({ children, className }: {
  children: React.ReactNode; className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // Size/position the ring to match the actual child's rendered box exactly —
  // measured via getBoundingClientRect so margins on the child (e.g. mt-4)
  // can never cause the ring to drift away from the real button outline.
  const syncRing = useCallback(() => {
    const wrap = wrapRef.current;
    const ring = ringRef.current;
    const child = wrap?.firstElementChild as HTMLElement | null;
    if (!wrap || !ring || !child) return;
    const wrapRect = wrap.getBoundingClientRect();
    const childRect = child.getBoundingClientRect();
    ring.style.top = `${childRect.top - wrapRect.top}px`;
    ring.style.left = `${childRect.left - wrapRect.left}px`;
    ring.style.width = `${childRect.width}px`;
    ring.style.height = `${childRect.height}px`;
  }, []);

  useEffect(() => {
    syncRing();
    window.addEventListener("resize", syncRing);
    return () => window.removeEventListener("resize", syncRing);
  }, [syncRing]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const ring = ringRef.current;
    if (!ring) return;
    const rect = ring.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const x = e.clientX - rect.left - cx;
    const y = e.clientY - rect.top - cy;
    let angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
    if (angle < 0) angle += 360;
    ring.style.setProperty("--glow-angle", `${angle.toFixed(1)}deg`);
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`golden-glow-wrap ${className ?? ""}`}
      onPointerEnter={syncRing}
      onPointerMove={handlePointerMove}
    >
      {children}
      <div ref={ringRef} className="golden-glow-ring" />
    </div>
  );
}
