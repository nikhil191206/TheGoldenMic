"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

export default function NavAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (user) {
    const avatar = user.user_metadata?.avatar_url as string | undefined;
    const name   = (user.user_metadata?.full_name ?? user.email ?? "U") as string;
    const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

    return (
      <Link href="/profile" title="My Profile"
        style={{ position: "fixed", top: 20, right: 20, zIndex: 50,
          display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
          background: "oklch(0.12 0.01 60 / 0.85)", backdropFilter: "blur(8px)",
          border: "1px solid oklch(0.75 0.15 85 / 0.3)", padding: "6px 14px 6px 6px",
          transition: "border-color 0.3s" }}>
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt={name} referrerPolicy="no-referrer"
            style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: 28, height: 28, borderRadius: "50%",
            background: "oklch(0.75 0.15 85 / 0.2)", display: "flex", alignItems: "center",
            justifyContent: "center", color: "oklch(0.75 0.15 85)", fontFamily: "system-ui", fontSize: 12, fontWeight: 600 }}>
            {initials}
          </div>
        )}
        <span style={{ fontFamily: "system-ui, sans-serif", fontSize: 12, letterSpacing: "0.06em",
          color: "oklch(0.75 0.03 85)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {name.split(" ")[0]}
        </span>
      </Link>
    );
  }

  return (
    <Link href="/auth/login"
      style={{ position: "fixed", top: 20, right: 20, zIndex: 50, textDecoration: "none",
        background: "oklch(0.12 0.01 60 / 0.85)", backdropFilter: "blur(8px)",
        border: "1px solid oklch(0.30 0.03 75 / 0.6)", padding: "8px 18px",
        fontFamily: "system-ui, sans-serif", fontSize: 12, letterSpacing: "0.12em",
        textTransform: "uppercase", color: "oklch(0.65 0.03 75)", transition: "all 0.3s" }}>
      Sign In
    </Link>
  );
}
