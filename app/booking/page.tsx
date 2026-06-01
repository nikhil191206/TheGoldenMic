"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

// 10:00 AM to 7:00 PM — 1-hour steps
const TIME_SLOTS: string[] = (() => {
  const slots: string[] = [];
  for (let h = 10; h <= 19; h++) {
    const hour12 = h > 12 ? h - 12 : h;
    const period = h >= 12 ? "PM" : "AM";
    slots.push(`${hour12}:00 ${period}`);
  }
  return slots;
})();

const DURATION_STEPS = [
  { value: "1Hr",     label: "1 Hour" },
  { value: "2Hr",     label: "2 Hours" },
  { value: "3Hr",     label: "3 Hours" },
  { value: "HalfDay", label: "Half Day  ·  4.5 Hrs" },
  { value: "FullDay", label: "Full Day  ·  9 Hrs" },
];

const GENDERS = ["Male", "Female", "Prefer not to say"];

const STUDIOS = [
  { value: "Studio-1", name: "Studio 1", tag: "Mini" },
  { value: "Studio-2", name: "Studio 2", tag: "Large" },
];

type FormData = {
  name: string;
  gender: string;
  age: string;
  singer_idol: string;
  booking_date: string;
  time_slot: string;
  duration: string;
  studio: string;
};

export default function BookingPage() {
  const [form, setForm] = useState<FormData>({
    name: "",
    gender: "",
    age: "",
    singer_idol: "",
    booking_date: "",
    time_slot: "",
    duration: "1Hr",
    studio: "",
  });
  const [durationIdx, setDurationIdx] = useState(0);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const timePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (timePickerRef.current && !timePickerRef.current.contains(e.target as Node)) {
        setTimePickerOpen(false);
      }
    }
    if (timePickerOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [timePickerOpen]);

  const set = (key: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const stepDuration = (delta: number) => {
    const newIdx = Math.max(0, Math.min(DURATION_STEPS.length - 1, durationIdx + delta));
    setDurationIdx(newIdx);
    setForm((f) => ({ ...f, duration: DURATION_STEPS[newIdx].value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.gender || !form.time_slot || !form.studio) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, age: parseInt(form.age) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save booking");
      }
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen w-full bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-sm">
          <div className="text-5xl mb-2">🎤</div>
          <h2 className="text-gold-gradient text-4xl font-light tracking-[0.08em]">
            You&apos;re Booked!
          </h2>
          <p style={{ fontFamily: "system-ui, sans-serif" }} className="text-muted-foreground text-base leading-relaxed">
            Thank you, {form.name}. Your slot at The Golden Mic is confirmed. See you there!
          </p>
          <Link
            href="/"
            className="inline-block mt-6 px-8 py-3 border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-500 tracking-[0.15em] text-sm uppercase"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          style={{ fontFamily: "system-ui, sans-serif", fontSize: "13px", letterSpacing: "0.05em" }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </Link>
        <span className="text-gold-gradient text-sm tracking-[0.2em] uppercase font-light">
          The Golden Mic
        </span>
        <div className="w-16" />
      </div>

      {/* Form container */}
      <div className="max-w-lg mx-auto px-6 py-14 pb-20">
        <h1 className="text-gold-gradient text-4xl sm:text-5xl font-light tracking-[0.1em] text-center mb-2">
          Book Your Slot
        </h1>
        <p
          className="text-center text-muted-foreground mb-12"
          style={{ fontFamily: "system-ui, sans-serif", fontSize: "14px", letterSpacing: "0.08em" }}
        >
          Studio hours: 10:00 AM – 8:00 PM
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">

          {/* ── Name ── */}
          <div className="space-y-2">
            <Label>Name</Label>
            <input
              required
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="field-input"
              style={inputStyle}
            />
          </div>

          {/* ── Gender ── */}
          <div className="space-y-3">
            <Label>Gender</Label>
            <div className="flex flex-wrap gap-3">
              {GENDERS.map((g) => (
                <label key={g} style={chipStyle(form.gender === g)}>
                  <input type="radio" name="gender" value={g} className="sr-only" onChange={() => set("gender", g)} />
                  {g}
                </label>
              ))}
            </div>
          </div>

          {/* ── Age ── */}
          <div className="space-y-2">
            <Label>Age</Label>
            <input
              required
              type="number"
              placeholder="Your age"
              min={1}
              max={120}
              value={form.age}
              onChange={(e) => set("age", e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* ── Singer Idol ── */}
          <div className="space-y-2">
            <Label>Your Singer Idol</Label>
            <input
              required
              type="text"
              placeholder="e.g. Arijit Singh, Taylor Swift…"
              value={form.singer_idol}
              onChange={(e) => set("singer_idol", e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* ── Booking Date ── */}
          <div className="space-y-2">
            <Label>Booking Date</Label>
            <input
              required
              type="date"
              value={form.booking_date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => set("booking_date", e.target.value)}
              style={{ ...inputStyle, colorScheme: "dark" }}
            />
          </div>

          {/* ── Start Time ── */}
          <div className="space-y-3" ref={timePickerRef}>
            <Label>Start Time</Label>

            <button
              type="button"
              onClick={() => setTimePickerOpen((o) => !o)}
              style={{
                ...inputStyle,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                borderColor: timePickerOpen ? "oklch(0.75 0.15 85)" : undefined,
                color: form.time_slot ? "oklch(0.95 0.02 85)" : "oklch(0.55 0.03 85)",
              }}
            >
              <span>{form.time_slot || "Select a time"}</span>
              <svg
                style={{ width: 18, height: 18, opacity: 0.5, flexShrink: 0 }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
              </svg>
            </button>

            {timePickerOpen && (
              <div
                style={{
                  border: "1px solid oklch(0.75 0.15 85 / 0.35)",
                  background: "oklch(0.12 0.01 60)",
                  padding: "12px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                }}
              >
                {TIME_SLOTS.map((t) => {
                  const active = form.time_slot === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { set("time_slot", t); setTimePickerOpen(false); }}
                      style={{
                        padding: "12px 8px",
                        fontFamily: "system-ui, sans-serif",
                        fontSize: "15px",
                        letterSpacing: "0.04em",
                        border: active
                          ? "1px solid oklch(0.75 0.15 85)"
                          : "1px solid oklch(0.3 0.03 75)",
                        background: active ? "oklch(0.75 0.15 85 / 0.12)" : "transparent",
                        color: active ? "oklch(0.75 0.15 85)" : "oklch(0.80 0.02 85)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Duration ── */}
          <div className="space-y-3">
            <Label>Duration</Label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid oklch(0.3 0.03 75)",
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={() => stepDuration(-1)}
                disabled={durationIdx === 0}
                style={{
                  width: 56,
                  height: 58,
                  fontSize: 26,
                  fontFamily: "system-ui",
                  color: durationIdx === 0 ? "oklch(0.4 0.02 75)" : "oklch(0.75 0.15 85)",
                  background: "oklch(0.12 0.01 60)",
                  border: "none",
                  borderRight: "1px solid oklch(0.3 0.03 75)",
                  cursor: durationIdx === 0 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                −
              </button>
              <span
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontFamily: "system-ui, sans-serif",
                  fontSize: "16px",
                  letterSpacing: "0.06em",
                  color: "oklch(0.92 0.04 85)",
                  padding: "0 8px",
                }}
              >
                {DURATION_STEPS[durationIdx].label}
              </span>
              <button
                type="button"
                onClick={() => stepDuration(1)}
                disabled={durationIdx === DURATION_STEPS.length - 1}
                style={{
                  width: 56,
                  height: 58,
                  fontSize: 26,
                  fontFamily: "system-ui",
                  color: durationIdx === DURATION_STEPS.length - 1 ? "oklch(0.4 0.02 75)" : "oklch(0.75 0.15 85)",
                  background: "oklch(0.12 0.01 60)",
                  border: "none",
                  borderLeft: "1px solid oklch(0.3 0.03 75)",
                  cursor: durationIdx === DURATION_STEPS.length - 1 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* ── Studio ── */}
          <div className="space-y-3">
            <Label>Select Studio</Label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {STUDIOS.map((s) => {
                const active = form.studio === s.value;
                return (
                  <label
                    key={s.value}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "24px 12px",
                      border: active
                        ? "2px solid oklch(0.75 0.15 85)"
                        : "1px solid oklch(0.3 0.03 75)",
                      background: active ? "oklch(0.75 0.15 85 / 0.08)" : "transparent",
                      cursor: "pointer",
                      transition: "all 0.25s",
                      gap: 6,
                    }}
                  >
                    <input
                      type="radio"
                      name="studio"
                      value={s.value}
                      className="sr-only"
                      onChange={() => set("studio", s.value)}
                    />
                    <span
                      style={{
                        fontFamily: "system-ui, sans-serif",
                        fontSize: "17px",
                        fontWeight: 600,
                        color: active ? "oklch(0.80 0.15 85)" : "oklch(0.88 0.02 85)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {s.name}
                    </span>
                    <span
                      style={{
                        fontFamily: "system-ui, sans-serif",
                        fontSize: "13px",
                        color: active ? "oklch(0.70 0.12 85)" : "oklch(0.60 0.02 85)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      {s.tag}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {error && (
            <p
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "14px",
                color: "oklch(0.65 0.2 25)",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              width: "100%",
              padding: "18px",
              border: "1px solid oklch(0.75 0.15 85 / 0.5)",
              background: "transparent",
              color: "oklch(0.75 0.15 85)",
              fontFamily: "system-ui, sans-serif",
              fontSize: "15px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
              transition: "all 0.4s",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.75 0.15 85)";
                (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.08 0.01 60)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.75 0.15 85)";
            }}
          >
            {loading ? "Confirming…" : "Confirm Booking"}
          </button>

        </form>
      </div>
    </main>
  );
}

/* ── Shared helpers ── */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "system-ui, sans-serif",
        fontSize: "13px",
        fontWeight: 500,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "oklch(0.68 0.06 85)",
      }}
    >
      {children}
    </p>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  background: "transparent",
  border: "1px solid oklch(0.3 0.03 75)",
  color: "oklch(0.93 0.02 85)",
  fontFamily: "system-ui, sans-serif",
  fontSize: "16px",
  letterSpacing: "0.03em",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

function chipStyle(active: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "10px 20px",
    border: active ? "1px solid oklch(0.75 0.15 85)" : "1px solid oklch(0.3 0.03 75)",
    background: active ? "oklch(0.75 0.15 85 / 0.10)" : "transparent",
    color: active ? "oklch(0.80 0.15 85)" : "oklch(0.72 0.03 85)",
    fontFamily: "system-ui, sans-serif",
    fontSize: "14px",
    letterSpacing: "0.06em",
    cursor: "pointer",
    transition: "all 0.25s",
    userSelect: "none",
  };
}
