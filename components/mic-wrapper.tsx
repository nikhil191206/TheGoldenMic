"use client";

import dynamic from "next/dynamic";

const ThreeMic = dynamic(() => import("@/components/three-mic"), {
  ssr: false,
  loading: () => <></>,
});

export default function MicWrapper({ onLoaded }: { onLoaded?: () => void }) {
  return <ThreeMic onLoaded={onLoaded} />;
}
