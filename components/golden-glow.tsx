"use client";

import "./golden-glow.css";

export default function GoldenGlow({ children, className }: {
  children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`golden-glow-wrap ${className ?? ""}`}>
      {children}
    </div>
  );
}
