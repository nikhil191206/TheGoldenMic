"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const TIME_SLOTS: string[] = (() => {
  const slots: string[] = [];
  for (let h = 9; h <= 21; h++) {
    for (const m of [0, 30]) {
      if (h === 21 && m === 30) break;
      const hour12 = h > 12 ? h - 12 : h;
      const period = h >= 12 ? "PM" : "AM";
      slots.push(`${hour12}:${m === 0 ? "00" : "30"} ${period}`);
    }
  }
  return slots;
})();

const DURATION_STEPS = [
  { value: "1Hr",     label: "1 Hr" },
  { value: "2Hr",     label: "2 Hr" },
  { value: "3Hr",     label: "3 Hr" },
  { value: "HalfDay", label: "Half Day · 4.5 Hr" },
  { value: "FullDay", label: "Full Day · 9 Hr" },
];

const GENDERS = ["Male", "Female", "Prefer not to say"];

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

  const inputClass =
    "w-full px-4 py-3 bg-transparent border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors text-sm tracking-wider";

  const chipClass = (active: boolean) =>
    `cursor-pointer px-4 py-2.5 border text-xs tracking-[0.15em] uppercase transition-all duration-300 select-none ${
      active
        ? "border-primary bg-primary/10 text-primary"
        : "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
    }`;

  if (success) {
    return (
      <main className="min-h-screen w-full bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-6">
          <h2 className="text-gold-gradient text-3xl font-light tracking-[0.1em]">
            Booking Confirmed
          </h2>
          <p className="text-muted-foreground tracking-wider text-sm">
            Thank you, {form.name}. We&apos;ll see you at The Golden Mic.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-8 py-3 border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-500 tracking-[0.2em] text-xs uppercase"
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
      <div className="flex items-center justify-between px-8 py-6 border-b border-border/30">
        <Link
          href="/"
          className="text-muted-foreground hover:text-primary transition-colors text-xs tracking-widest uppercase flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </Link>
        <span className="text-gold-gradient text-sm tracking-[0.2em] uppercase font-light">
          The Golden Mic
        </span>
        <div className="w-16" />
      </div>

      {/* Form */}
      <div className="max-w-xl mx-auto px-6 py-16">
        <h1 className="text-gold-gradient text-3xl sm:text-4xl font-light tracking-[0.12em] text-center mb-2">
          Book Your Slot
        </h1>
        <p className="text-muted-foreground text-center text-xs tracking-[0.2em] uppercase mb-12">
          Fill in your details below
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-7">

          {/* Name */}
          <input
            required
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputClass}
          />

          {/* Gender */}
          <div className="space-y-3">
            <p className="text-muted-foreground/60 text-xs tracking-[0.2em] uppercase">Gender</p>
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g) => (
                <label key={g} className={chipClass(form.gender === g)}>
                  <input type="radio" name="gender" value={g} className="sr-only" onChange={() => set("gender", g)} />
                  {g}
                </label>
              ))}
            </div>
          </div>

          {/* Age */}
          <input
            required
            type="number"
            placeholder="Age"
            min={1}
            max={120}
            value={form.age}
            onChange={(e) => set("age", e.target.value)}
            className={inputClass}
          />

          {/* Singer Idol */}
          <input
            required
            type="text"
            placeholder="Your Singer Idol"
            value={form.singer_idol}
            onChange={(e) => set("singer_idol", e.target.value)}
            className={inputClass}
          />

          {/* Booking Date */}
          <div className="space-y-3">
            <p className="text-muted-foreground/60 text-xs tracking-[0.2em] uppercase">Booking Date</p>
            <input
              required
              type="date"
              value={form.booking_date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => set("booking_date", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Start Time — clickable chip grid */}
          <div className="space-y-3" ref={timePickerRef}>
            <p className="text-muted-foreground/60 text-xs tracking-[0.2em] uppercase">Start Time</p>

            <button
              type="button"
              onClick={() => setTimePickerOpen((o) => !o)}
              className={`w-full px-4 py-3 border text-sm tracking-wider text-left flex items-center justify-between transition-colors ${
                timePickerOpen ? "border-primary" : "border-border/50 hover:border-primary/50"
              } ${form.time_slot ? "text-foreground" : "text-muted-foreground/50"}`}
            >
              <span>{form.time_slot || "Select start time"}</span>
              {/* clock icon */}
              <svg className="w-4 h-4 text-muted-foreground/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
              </svg>
            </button>

            {timePickerOpen && (
              <div className="border border-primary/30 bg-background p-3">
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {TIME_SLOTS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { set("time_slot", t); setTimePickerOpen(false); }}
                      className={`py-2.5 px-3 text-xs tracking-wider border transition-all duration-200 ${
                        form.time_slot === t
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/30 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Duration — stepper */}
          <div className="space-y-3">
            <p className="text-muted-foreground/60 text-xs tracking-[0.2em] uppercase">Duration</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => stepDuration(-1)}
                disabled={durationIdx === 0}
                className="w-11 h-11 border border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center text-xl leading-none"
              >
                −
              </button>
              <span className="flex-1 text-center text-sm tracking-widest text-foreground min-w-0">
                {DURATION_STEPS[durationIdx].label}
              </span>
              <button
                type="button"
                onClick={() => stepDuration(1)}
                disabled={durationIdx === DURATION_STEPS.length - 1}
                className="w-11 h-11 border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center text-xl leading-none"
              >
                +
              </button>
            </div>
          </div>

          {/* Studio — dropdown */}
          <div className="space-y-3">
            <p className="text-muted-foreground/60 text-xs tracking-[0.2em] uppercase">Select Studio</p>
            <select
              required
              value={form.studio}
              onChange={(e) => set("studio", e.target.value)}
              className={`${inputClass} bg-background cursor-pointer`}
            >
              <option value="" disabled>— Select Studio —</option>
              <option value="Studio-1">Studio-1 (Mini)</option>
              <option value="Studio-2">Studio-2 (Large)</option>
            </select>
          </div>

          {error && (
            <p className="text-red-400/80 text-xs tracking-wider text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-4 border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-500 tracking-[0.2em] text-sm uppercase disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Confirming..." : "Confirm Booking"}
          </button>

        </form>
      </div>
    </main>
  );
}
