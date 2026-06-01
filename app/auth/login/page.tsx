"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/booking";
  const error = searchParams.get("error");

  const signIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  };

  return (
    <main className="min-h-screen w-full bg-background flex items-center justify-center px-6">
      <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
          <Link href="/" className="text-gold-gradient font-light"
            style={{ fontSize: "clamp(1.6rem, 6vw, 2.4rem)", letterSpacing: "0.15em" }}>
            The Golden Mic
          </Link>
          <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, letterSpacing: "0.2em",
            textTransform: "uppercase", color: "oklch(0.50 0.03 75)" }}>
            Karaoke Studio
          </p>
        </div>

        {/* Card */}
        <div style={{ width: "100%", border: "1px solid oklch(0.25 0.02 75)",
          padding: "40px 32px", display: "flex", flexDirection: "column", gap: 24 }}>

          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300,
              letterSpacing: "0.08em", color: "oklch(0.92 0.02 85)" }}>
              Sign in to continue
            </h1>
            <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, color: "oklch(0.50 0.03 75)", letterSpacing: "0.04em" }}>
              Book your session at The Golden Mic
            </p>
          </div>

          {error && (
            <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, color: "oklch(0.65 0.2 25)",
              textAlign: "center", padding: "10px", border: "1px solid oklch(0.65 0.2 25 / 0.3)", background: "oklch(0.65 0.2 25 / 0.05)" }}>
              Sign-in failed. Please try again.
            </p>
          )}

          {/* Google button */}
          <button onClick={signIn}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
              padding: "13px 20px", background: "#ffffff", border: "1px solid #e0e0e0",
              cursor: "pointer", transition: "background 0.2s", fontFamily: "system-ui, sans-serif",
              fontSize: 15, fontWeight: 500, color: "#3c4043", letterSpacing: "0.01em" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#f8f8f8")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#ffffff")}
          >
            {/* Google logo SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 11, color: "oklch(0.40 0.02 75)",
            textAlign: "center", letterSpacing: "0.04em", lineHeight: 1.6 }}>
            By signing in you agree to our terms. Your Google account
            info is used only for authentication.
          </p>
        </div>

        <Link href="/" style={{ fontFamily: "system-ui, sans-serif", fontSize: 12,
          color: "oklch(0.45 0.03 75)", letterSpacing: "0.1em", textTransform: "uppercase",
          textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to home
        </Link>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
