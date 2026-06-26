"use client";

import BorderGlow from "@/components/BorderGlow";

export default function GoldenGlow({ children, className }: {
  children: React.ReactNode; className?: string;
}) {
  return (
    <BorderGlow
      className={`golden-glow-btn ${className ?? ""}`}
      edgeSensitivity={8}
      glowColor="45 70 65"
      backgroundColor="transparent"
      borderRadius={0}
      glowRadius={3}
      glowIntensity={1}
      coneSpread={30}
      animated={false}
      colors={["#D4AF37", "#F5D27A", "#8B6210"]}
    >
      {children}
    </BorderGlow>
  );
}
