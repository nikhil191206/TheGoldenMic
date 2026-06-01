"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function SignOutButton() {
  const router = useRouter();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button onClick={signOut}
      style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, letterSpacing: "0.08em",
        color: "oklch(0.50 0.03 75)", background: "none", border: "none", cursor: "pointer",
        padding: 0, transition: "color 0.2s" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "oklch(0.75 0.15 85)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "oklch(0.50 0.03 75)")}
    >
      Sign Out
    </button>
  );
}
