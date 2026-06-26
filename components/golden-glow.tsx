"use client";

import BorderGlow from "@/components/BorderGlow";

export default function GoldenGlow({ children, className }: {
  children: React.ReactNode; className?: string;
}) {
  return (
    <BorderGlow
      className={className}
      edgeSensitivity={35}
      glowColor="45 70 65"
      backgroundColor="transparent"
      borderRadius={0}
      glowRadius={14}
      glowIntensity={0.9}
      coneSpread={25}
      animated={false}
      colors={["#D4AF37", "#F5D27A", "#8B6210"]}
    >
      {children}
    </BorderGlow>
  );
}
