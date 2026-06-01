"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { hasConflict } from "@/lib/booking-utils";

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
  { value: "Studio-1", name: "Studio 1", tag: "Mini",  comingSoon: false },
  { value: "Studio-2", name: "Studio 2", tag: "Large", comingSoon: true  },
];

type FormData = {
  name: string;
  gender: string;
  age: string;
  phone: string;
  email: string;
  people_count: string;
  singer_idol: string;
  booking_date: string;
  time_slot: string;
  duration: string;
  studio: string;
};

export default function BookingPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormData>({
    name: "", gender: "", age: "", phone: "", email: "",
    people_count: "", singer_idol: "", booking_date: "",
    time_slot: "", duration: "1Hr", studio: "",
  });
  const [durationIdx, setDurationIdx]   = useState(0);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [takenHours, setTakenHours]     = useState<number[]>([]);
  const [error, setError]               = useState("");

  // Payment step state
  const [txnId, setTxnId]               = useState("");
  const [txnFile, setTxnFile]           = useState<File | null>(null);
  const [paymentError, setPaymentError] = useState("");
  const [loading, setLoading]           = useState(false);
  const [success, setSuccess]           = useState(false);

  const timePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!form.studio || !form.booking_date) { setTakenHours([]); return; }
    fetch(`/api/availability?studio=${encodeURIComponent(form.studio)}&date=${form.booking_date}`)
      .then((r) => r.json())
      .then((d) => setTakenHours(d.occupiedHours ?? []))
      .catch(() => setTakenHours([]));
  }, [form.studio, form.booking_date]);

  useEffect(() => {
    if (form.time_slot && hasConflict(form.time_slot, form.duration, takenHours)) {
      setForm((f) => ({ ...f, time_slot: "" }));
    }
  }, [takenHours, form.duration]);

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (timePickerRef.current && !timePickerRef.current.contains(e.target as Node))
        setTimePickerOpen(false);
    }
    if (timePickerOpen) document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [timePickerOpen]);

  const set = (key: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const stepDuration = (delta: number) => {
    const newIdx = Math.max(0, Math.min(DURATION_STEPS.length - 1, durationIdx + delta));
    setDurationIdx(newIdx);
    setForm((f) => ({ ...f, duration: DURATION_STEPS[newIdx].value }));
  };

  const isAvailable = (slot: string) => !hasConflict(slot, form.duration, takenHours);

  // ── Step 1 → Step 2 ──
  const handleNext = () => {
    const { name, gender, age, phone, email, people_count, singer_idol, booking_date, time_slot, studio } = form;
    if (!name || !gender || !age || !phone || !email || !people_count ||
        !singer_idol || !booking_date || !time_slot || !studio) {
      setError("Please fill in all fields before continuing.");
      return;
    }
    setError("");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Step 2 submit ──
  const handleConfirm = async () => {
    if (!txnId && !txnFile) {
      setPaymentError("Please enter a Transaction ID or upload a payment screenshot.");
      return;
    }
    setLoading(true);
    setPaymentError("");

    let txnScreenshotUrl = "";

    if (txnFile) {
      const fd = new FormData();
      fd.append("file", txnFile);
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      if (!up.ok) {
        const d = await up.json();
        setPaymentError(d.error ?? "Screenshot upload failed. Please try again.");
        setLoading(false);
        return;
      }
      const upData = await up.json();
      txnScreenshotUrl = upData.url;
    }

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        age: parseInt(form.age),
        people_count: parseInt(form.people_count),
        txn_id: txnId || null,
        txn_screenshot_url: txnScreenshotUrl || null,
      }),
    });

    if (!res.ok) {
      const d = await res.json();
      setPaymentError(d.error ?? "Booking failed. Please try again.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  // ── Success ──
  if (success) {
    return (
      <main className="min-h-screen w-full bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-sm">
          <div style={{ fontSize: 52 }}>🎤</div>
          <h2 className="text-gold-gradient font-light" style={{ fontSize: "clamp(2rem, 8vw, 2.8rem)", letterSpacing: "0.08em" }}>
            You&apos;re Booked!
          </h2>
          <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 15, color: "oklch(0.65 0.03 85)", lineHeight: 1.7 }}>
            Thank you, {form.name}. We&apos;ve received your booking and payment proof.
            Our team will confirm shortly.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-500 uppercase"
            style={{ padding: "14px 36px", fontFamily: "system-ui", fontSize: 13, letterSpacing: "0.2em" }}
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-background">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-border/30">
        <button
          onClick={() => step === 2 ? setStep(1) : undefined}
          style={{ background: "none", border: "none", padding: 0 }}
        >
          {step === 2 ? (
            <span
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, letterSpacing: "0.05em", cursor: "pointer" }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Back
            </span>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, letterSpacing: "0.05em" }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Back
            </Link>
          )}
        </button>
        <span className="text-gold-gradient uppercase font-light"
          style={{ fontSize: "clamp(0.65rem, 2.5vw, 0.875rem)", letterSpacing: "0.15em" }}>
          The Golden Mic
        </span>
        {/* Step indicator */}
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2].map((s) => (
            <div key={s} style={{
              width: 24, height: 3,
              background: step >= s ? "oklch(0.75 0.15 85)" : "oklch(0.25 0.02 75)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>
      </div>

      {/* ── Step 1: Booking Details ── */}
      {step === 1 && (
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 sm:py-14 pb-20">
          <h1 className="text-gold-gradient font-light tracking-[0.1em] text-center mb-2"
            style={{ fontSize: "clamp(2rem, 8vw, 3rem)" }}>
            Book Your Slot
          </h1>
          <p className="text-center text-muted-foreground mb-12"
            style={{ fontFamily: "system-ui, sans-serif", fontSize: 14, letterSpacing: "0.08em" }}>
            Studio hours: 10:00 AM – 8:00 PM
          </p>

          <div className="flex flex-col gap-7">
            <Field label="Name">
              <input required type="text" placeholder="Your full name"
                value={form.name} onChange={(e) => set("name", e.target.value)} style={inputStyle} />
            </Field>

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

            <Field label="Age">
              <input required type="number" placeholder="Your age" min={1} max={120}
                value={form.age} onChange={(e) => set("age", e.target.value)} style={inputStyle} />
            </Field>

            <Field label="Phone Number">
              <input required type="tel" placeholder="+91 XXXXX XXXXX"
                value={form.phone} onChange={(e) => set("phone", e.target.value)} style={inputStyle} />
            </Field>

            <Field label="Email ID">
              <input required type="email" placeholder="your@email.com"
                value={form.email} onChange={(e) => set("email", e.target.value)} style={inputStyle} />
            </Field>

            <Field label="Number of People">
              <input required type="number" placeholder="How many people?" min={1} max={50}
                value={form.people_count} onChange={(e) => set("people_count", e.target.value)} style={inputStyle} />
            </Field>

            <Field label="Your Singer Idol">
              <input required type="text" placeholder="e.g. Arijit Singh, Taylor Swift…"
                value={form.singer_idol} onChange={(e) => set("singer_idol", e.target.value)} style={inputStyle} />
            </Field>

            <Field label="Booking Date">
              <input required type="date"
                value={form.booking_date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => set("booking_date", e.target.value)}
                style={{ ...inputStyle, colorScheme: "dark" }} />
            </Field>

            {/* Start Time */}
            <div className="space-y-3" ref={timePickerRef}>
              <Label>Start Time</Label>
              <button type="button" onClick={() => setTimePickerOpen((o) => !o)}
                style={{ ...inputStyle, display: "flex", alignItems: "center", justifyContent: "space-between",
                  cursor: "pointer", borderColor: timePickerOpen ? "oklch(0.75 0.15 85)" : undefined,
                  color: form.time_slot ? "oklch(0.95 0.02 85)" : "oklch(0.55 0.03 85)" }}>
                <span>{form.time_slot || "Select a time"}</span>
                <svg style={{ width: 18, height: 18, opacity: 0.5, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                </svg>
              </button>
              {timePickerOpen && (
                <div style={{ border: "1px solid oklch(0.75 0.15 85 / 0.35)", background: "oklch(0.12 0.01 60)",
                  padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {TIME_SLOTS.map((t) => {
                    const active = form.time_slot === t;
                    const avail  = isAvailable(t);
                    return (
                      <button key={t} type="button" disabled={!avail}
                        onClick={() => { if (avail) { set("time_slot", t); setTimePickerOpen(false); } }}
                        title={!avail ? "Already booked" : undefined}
                        style={{ padding: "12px 8px", fontFamily: "system-ui, sans-serif", fontSize: 15,
                          letterSpacing: "0.04em", transition: "all 0.2s", cursor: avail ? "pointer" : "not-allowed",
                          textDecoration: !avail ? "line-through" : "none",
                          border: active ? "1px solid oklch(0.75 0.15 85)" : !avail ? "1px solid oklch(0.22 0.02 60)" : "1px solid oklch(0.3 0.03 75)",
                          background: active ? "oklch(0.75 0.15 85 / 0.12)" : !avail ? "oklch(0.14 0.01 60)" : "transparent",
                          color: active ? "oklch(0.75 0.15 85)" : !avail ? "oklch(0.35 0.02 60)" : "oklch(0.80 0.02 85)" }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Duration stepper */}
            <div className="space-y-3">
              <Label>Duration</Label>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid oklch(0.3 0.03 75)", overflow: "hidden" }}>
                <StepBtn onClick={() => stepDuration(-1)} disabled={durationIdx === 0}>−</StepBtn>
                <span style={{ flex: 1, textAlign: "center", fontFamily: "system-ui, sans-serif",
                  fontSize: "clamp(13px, 3.5vw, 16px)", letterSpacing: "0.04em", color: "oklch(0.92 0.04 85)",
                  padding: "0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {DURATION_STEPS[durationIdx].label}
                </span>
                <StepBtn onClick={() => stepDuration(1)} disabled={durationIdx === DURATION_STEPS.length - 1} right>+</StepBtn>
              </div>
            </div>

            {/* Studio */}
            <div className="space-y-3">
              <Label>Select Studio</Label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {STUDIOS.map((s) => {
                  const active = form.studio === s.value && !s.comingSoon;
                  return (
                    <label key={s.value} style={{
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      padding: "24px 12px", gap: 6, cursor: s.comingSoon ? "not-allowed" : "pointer",
                      transition: "all 0.25s", position: "relative", overflow: "hidden",
                      border: s.comingSoon ? "1px solid oklch(0.18 0.01 60)" : active ? "2px solid oklch(0.75 0.15 85)" : "1px solid oklch(0.3 0.03 75)",
                      background: s.comingSoon ? "oklch(0.10 0.01 60)" : active ? "oklch(0.75 0.15 85 / 0.08)" : "transparent",
                    }}>
                      <input type="radio" name="studio" value={s.value} className="sr-only"
                        disabled={s.comingSoon} onChange={() => !s.comingSoon && set("studio", s.value)} />
                      <span style={{ fontFamily: "system-ui, sans-serif", fontSize: 17, fontWeight: 600, letterSpacing: "0.04em",
                        color: s.comingSoon ? "oklch(0.35 0.01 60)" : active ? "oklch(0.80 0.15 85)" : "oklch(0.88 0.02 85)" }}>
                        {s.name}
                      </span>
                      <span style={{ fontFamily: "system-ui, sans-serif", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase",
                        color: s.comingSoon ? "oklch(0.30 0.01 60)" : active ? "oklch(0.70 0.12 85)" : "oklch(0.60 0.02 85)" }}>
                        {s.comingSoon ? "Coming Soon" : s.tag}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {error && <ErrMsg>{error}</ErrMsg>}

            {/* Next button */}
            <GoldButton onClick={handleNext} style={{ marginTop: 8 }}>
              Next — Proceed to Payment
            </GoldButton>
          </div>
        </div>
      )}

      {/* ── Step 2: Payment ── */}
      {step === 2 && (
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 sm:py-14 pb-20">
          <h1 className="text-gold-gradient font-light tracking-[0.1em] text-center mb-2"
            style={{ fontSize: "clamp(1.8rem, 7vw, 2.6rem)" }}>
            Complete Payment
          </h1>
          <p className="text-center text-muted-foreground mb-10"
            style={{ fontFamily: "system-ui, sans-serif", fontSize: 14, letterSpacing: "0.08em" }}>
            Scan the QR to pay, then share your proof below
          </p>

          {/* QR Code */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
            <div style={{
              padding: 14,
              background: "#ffffff",
              border: "2px solid oklch(0.75 0.15 85)",
              boxShadow: "0 0 0 1px oklch(0.75 0.15 85 / 0.15), 0 0 28px oklch(0.75 0.15 85 / 0.25), 0 0 56px oklch(0.75 0.15 85 / 0.1)",
              display: "inline-block",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/payment_qr.jpeg"
                alt="Payment QR Code"
                style={{ width: 220, height: 220, display: "block", objectFit: "contain" }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Transaction ID */}
            <Field label="Transaction ID / UTR Number">
              <input type="text" placeholder="Enter transaction ID after payment"
                value={txnId} onChange={(e) => setTxnId(e.target.value)} style={inputStyle} />
            </Field>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1, height: 1, background: "oklch(0.25 0.02 75)" }} />
              <span style={{ fontFamily: "system-ui, sans-serif", fontSize: 12,
                letterSpacing: "0.15em", color: "oklch(0.45 0.03 75)", textTransform: "uppercase" }}>OR</span>
              <div style={{ flex: 1, height: 1, background: "oklch(0.25 0.02 75)" }} />
            </div>

            {/* Screenshot upload */}
            <div className="space-y-2">
              <Label>Payment Screenshot</Label>
              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: 8, padding: "28px 16px",
                border: txnFile ? "1px solid oklch(0.75 0.15 85)" : "1px dashed oklch(0.3 0.03 75)",
                background: txnFile ? "oklch(0.75 0.15 85 / 0.05)" : "transparent",
                cursor: "pointer", transition: "all 0.25s",
              }}>
                <input type="file" accept="image/*" className="sr-only"
                  onChange={(e) => setTxnFile(e.target.files?.[0] ?? null)} />
                {txnFile ? (
                  <span style={{ fontFamily: "system-ui, sans-serif", fontSize: 14,
                    color: "oklch(0.75 0.15 85)", letterSpacing: "0.04em" }}>
                    ✓ {txnFile.name}
                  </span>
                ) : (
                  <>
                    <svg style={{ width: 28, height: 28, color: "oklch(0.45 0.03 75)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span style={{ fontFamily: "system-ui, sans-serif", fontSize: 14, color: "oklch(0.55 0.03 75)" }}>
                      Upload payment screenshot
                    </span>
                    <span style={{ fontFamily: "system-ui, sans-serif", fontSize: 11, color: "oklch(0.40 0.02 75)" }}>
                      PNG, JPG — max 5 MB
                    </span>
                  </>
                )}
              </label>
            </div>

            {paymentError && <ErrMsg>{paymentError}</ErrMsg>}

            <GoldButton onClick={handleConfirm} disabled={loading} style={{ marginTop: 8 }}>
              {loading ? "Confirming…" : "Confirm Booking"}
            </GoldButton>
          </div>
        </div>
      )}
    </main>
  );
}

/* ── Shared helpers ── */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, fontWeight: 500,
      letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.68 0.06 85)" }}>
      {children}
    </p>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ErrMsg({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 14,
      color: "oklch(0.65 0.2 25)", textAlign: "center" }}>
      {children}
    </p>
  );
}

function StepBtn({ children, onClick, disabled, right }: {
  children: React.ReactNode; onClick: () => void; disabled: boolean; right?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      style={{ width: 56, height: 58, fontSize: 26, fontFamily: "system-ui",
        color: disabled ? "oklch(0.4 0.02 75)" : "oklch(0.75 0.15 85)",
        background: "oklch(0.12 0.01 60)", border: "none",
        borderRight: !right ? "1px solid oklch(0.3 0.03 75)" : undefined,
        borderLeft: right ? "1px solid oklch(0.3 0.03 75)" : undefined,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {children}
    </button>
  );
}

function GoldButton({ children, onClick, disabled, style }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; style?: React.CSSProperties;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      style={{ width: "100%", padding: 18, border: "1px solid oklch(0.75 0.15 85 / 0.5)",
        background: "transparent", color: "oklch(0.75 0.15 85)", fontFamily: "system-ui, sans-serif",
        fontSize: 15, letterSpacing: "0.2em", textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
        transition: "all 0.4s", ...style }}
      onMouseEnter={(e) => { if (!disabled) {
        (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.75 0.15 85)";
        (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.08 0.01 60)";
      }}}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.75 0.15 85)";
      }}>
      {children}
    </button>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", background: "transparent",
  border: "1px solid oklch(0.3 0.03 75)", color: "oklch(0.93 0.02 85)",
  fontFamily: "system-ui, sans-serif", fontSize: 16,
  letterSpacing: "0.03em", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box",
};

function chipStyle(active: boolean): React.CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", padding: "10px 20px", userSelect: "none",
    border: active ? "1px solid oklch(0.75 0.15 85)" : "1px solid oklch(0.3 0.03 75)",
    background: active ? "oklch(0.75 0.15 85 / 0.10)" : "transparent",
    color: active ? "oklch(0.80 0.15 85)" : "oklch(0.72 0.03 85)",
    fontFamily: "system-ui, sans-serif", fontSize: 14, letterSpacing: "0.06em",
    cursor: "pointer", transition: "all 0.25s",
  };
}
