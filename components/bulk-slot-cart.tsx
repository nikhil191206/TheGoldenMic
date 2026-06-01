"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { hasConflict } from "@/lib/booking-utils";
import { DURATION_HOURS, fmt } from "@/lib/pricing";

const TIME_SLOTS = (() => {
  const s: string[] = [];
  for (let h = 10; h <= 19; h++) s.push(`${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "PM" : "AM"}`);
  return s;
})();

const DURATIONS = [
  { value: "1Hr", label: "1 Hour" }, { value: "2Hr", label: "2 Hours" },
  { value: "3Hr", label: "3 Hours" }, { value: "HalfDay", label: "Half Day · 4.5 Hrs" },
  { value: "FullDay", label: "Full Day · 9 Hrs" },
];

type BulkBooking = {
  id: string; booking_type: string; start_date: string; end_date: string;
  total_hours: number; used_hours: number; payment_complete: boolean;
};
type Slot = { booking_date: string; time_slot: string; duration: string; studio: string };

export default function BulkSlotCart({ bulkBooking: bb, existingSlots }: { bulkBooking: BulkBooking; existingSlots: Slot[] }) {
  const [date, setDate]           = useState("");
  const [studio, setStudio]       = useState("Studio-1");
  const [timeSlot, setTimeSlot]   = useState("");
  const [durIdx, setDurIdx]       = useState(0);
  const [takenHours, setTakenHours] = useState<number[]>([]);
  const [timeOpen, setTimeOpen]   = useState(false);
  const [cart, setCart]           = useState<Slot[]>([]);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const cartHours = cart.reduce((s, sl) => s + (DURATION_HOURS[sl.duration] ?? 0), 0);
  const remaining = bb.total_hours - bb.used_hours - cartHours;

  // Available durations: those whose hours <= remaining
  const availDurs = DURATIONS.filter(d => (DURATION_HOURS[d.value] ?? 0) <= remaining + (DURATION_HOURS[DURATIONS[durIdx].value] ?? 0));

  useEffect(() => {
    if (!studio || !date) { setTakenHours([]); return; }
    fetch(`/api/availability?studio=${encodeURIComponent(studio)}&date=${date}`)
      .then(r => r.json()).then(d => setTakenHours(d.occupiedHours ?? []));
  }, [studio, date]);

  useEffect(() => {
    function outside(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setTimeOpen(false); }
    if (timeOpen) document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [timeOpen]);

  const isAvail = (t: string) => !hasConflict(t, DURATIONS[durIdx].value, [
    ...takenHours,
    ...cart.filter(s => s.booking_date === date && s.studio === studio)
         .flatMap(s => { const h = DURATION_HOURS[s.time_slot] ?? 0; return []; }), // client-side cart slots checked below
  ]) && !cart.some(s => s.booking_date === date && s.studio === studio &&
    hasConflict(t, DURATIONS[durIdx].value, [parseInt(s.time_slot.split(":")[0]) + (s.time_slot.includes("PM") && !s.time_slot.startsWith("12") ? 12 : 0)]));

  const addToCart = () => {
    if (!date || !timeSlot) { setError("Select date and time."); return; }
    if (date < bb.start_date || date > bb.end_date) { setError(`Date must be within ${bb.start_date} – ${bb.end_date}`); return; }
    if ((DURATION_HOURS[DURATIONS[durIdx].value] ?? 0) > remaining) { setError("Not enough hours remaining."); return; }
    setCart(c => [...c, { booking_date: date, time_slot: timeSlot, duration: DURATIONS[durIdx].value, studio }]);
    setTimeSlot(""); setError("");
  };

  const removeFromCart = (i: number) => setCart(c => c.filter((_, idx) => idx !== i));

  const confirm = async () => {
    if (cart.length === 0) { setError("Add at least one slot."); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/bulk-booking-slots", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bulk_booking_id: bb.id, slots: cart }),
    });
    if (!res.ok) { setError((await res.json()).error ?? "Failed."); setLoading(false); return; }
    setSuccess(true); setLoading(false);
  };

  if (success) return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div style={{ textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:20 }}>
        <div style={{ fontSize:48 }}>✓</div>
        <h2 className="text-gold-gradient font-light" style={{ fontSize:"clamp(1.8rem,6vw,2.4rem)", letterSpacing:"0.08em" }}>Sessions Booked!</h2>
        <p style={{ fontFamily:"system-ui", fontSize:14, color:"oklch(0.65 0.03 85)", maxWidth:320, lineHeight:1.7 }}>
          Your sessions have been added to your bulk plan. Hours have been deducted from your remaining balance.
        </p>
        <Link href="/profile" style={{ padding:"12px 28px", border:"1px solid oklch(0.75 0.15 85 / 0.5)", color:"oklch(0.75 0.15 85)",
          fontFamily:"system-ui", fontSize:13, letterSpacing:"0.15em", textTransform:"uppercase", textDecoration:"none" }}>
          Back to Profile
        </Link>
      </div>
    </main>
  );

  if (!bb.payment_complete) return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div style={{ textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:16, maxWidth:360 }}>
        <h2 style={{ fontFamily:"system-ui", fontSize:18, color:"oklch(0.80 0.02 85)", letterSpacing:"0.04em" }}>Awaiting Payment Confirmation</h2>
        <p style={{ fontFamily:"system-ui", fontSize:14, color:"oklch(0.55 0.03 75)", lineHeight:1.7 }}>
          Our team is verifying your payment. You can book slots once your plan is confirmed.
        </p>
        <Link href="/profile" style={{ color:"oklch(0.72 0.12 85)", fontFamily:"system-ui", fontSize:13, textDecoration:"underline" }}>Back to Profile</Link>
      </div>
    </main>
  );

  const durationLabel: Record<string, string> = { "1Hr":"1 Hr","2Hr":"2 Hrs","3Hr":"3 Hrs","HalfDay":"Half Day","FullDay":"Full Day" };

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-border/30">
        <Link href="/profile" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          style={{ fontFamily:"system-ui", fontSize:13 }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 12H5M12 5l-7 7 7 7"/></svg>Profile
        </Link>
        <span className="text-gold-gradient uppercase font-light" style={{ fontSize:"clamp(0.65rem,2.5vw,0.875rem)", letterSpacing:"0.15em" }}>The Golden Mic</span>
        <div className="w-16"/>
      </div>

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 pb-24">
        <h1 className="text-gold-gradient font-light text-center mb-2" style={{ fontSize:"clamp(1.8rem,6vw,2.4rem)", letterSpacing:"0.1em" }}>Book Sessions</h1>

        {/* Hours bar */}
        <div style={{ marginBottom:28, padding:"14px 16px", border:"1px solid oklch(0.28 0.03 75)", background:"oklch(0.10 0.01 60)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontFamily:"system-ui", fontSize:12, color:"oklch(0.55 0.03 75)", letterSpacing:"0.08em", textTransform:"uppercase" }}>Hours remaining</span>
            <span style={{ fontFamily:"system-ui", fontSize:14, fontWeight:700, color:"oklch(0.75 0.15 85)" }}>{remaining} / {bb.total_hours} hrs</span>
          </div>
          <div style={{ height:4, background:"oklch(0.20 0.02 60)", borderRadius:2, overflow:"hidden" }}>
            <div style={{ height:"100%", background:"oklch(0.75 0.15 85)", borderRadius:2, width:`${(remaining/bb.total_hours)*100}%`, transition:"width 0.4s" }}/>
          </div>
          <p style={{ fontFamily:"system-ui", fontSize:11, color:"oklch(0.45 0.02 75)", marginTop:6, letterSpacing:"0.04em" }}>
            Valid: {new Date(bb.start_date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})} → {new Date(bb.end_date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Date */}
          <div className="space-y-2">
            <Lbl>Date</Lbl>
            <input type="date" value={date} min={bb.start_date} max={bb.end_date}
              onChange={e=>{ setDate(e.target.value); setTimeSlot(""); }}
              style={{ ...IS, colorScheme:"dark" }}/>
          </div>

          {/* Studio */}
          <div className="space-y-2">
            <Lbl>Studio</Lbl>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[{v:"Studio-1",l:"Studio 1",t:"Mini"},{v:"Studio-2",l:"Studio 2",t:"Coming Soon",disabled:true}].map(s=>(
                <label key={s.v} style={{
                  display:"flex",flexDirection:"column",alignItems:"center",padding:"16px 8px",gap:4,
                  cursor:s.disabled?"not-allowed":"pointer",transition:"all 0.2s",
                  border:s.disabled?"1px solid oklch(0.18 0.01 60)":studio===s.v?"2px solid oklch(0.75 0.15 85)":"1px solid oklch(0.3 0.03 75)",
                  background:s.disabled?"oklch(0.10 0.01 60)":studio===s.v?"oklch(0.75 0.15 85 / 0.08)":"transparent",
                }}>
                  <input type="radio" className="sr-only" name="bstudio" disabled={s.disabled} onChange={()=>{ if(!s.disabled){setStudio(s.v);setTimeSlot("");} }}/>
                  <span style={{ fontFamily:"system-ui",fontSize:15,fontWeight:600,color:s.disabled?"oklch(0.35 0.01 60)":studio===s.v?"oklch(0.80 0.15 85)":"oklch(0.88 0.02 85)" }}>{s.l}</span>
                  <span style={{ fontFamily:"system-ui",fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:s.disabled?"oklch(0.30 0.01 60)":"oklch(0.55 0.02 75)" }}>{s.t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Time slot */}
          <div className="space-y-2" ref={ref}>
            <Lbl>Start Time</Lbl>
            <button type="button" onClick={()=>setTimeOpen(o=>!o)}
              style={{ ...IS, display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",
                color:timeSlot?"oklch(0.95 0.02 85)":"oklch(0.55 0.03 85)" }}>
              <span>{timeSlot||"Select time"}</span>
              <svg style={{width:18,height:18,opacity:0.5}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"/>
              </svg>
            </button>
            {timeOpen && (
              <div style={{ border:"1px solid oklch(0.75 0.15 85 / 0.35)",background:"oklch(0.12 0.01 60)",padding:12,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                {TIME_SLOTS.map(t=>{
                  const active=timeSlot===t;
                  const avail=!hasConflict(t,DURATIONS[durIdx].value,takenHours);
                  return (
                    <button key={t} type="button" disabled={!avail} onClick={()=>{ if(avail){setTimeSlot(t);setTimeOpen(false);} }}
                      style={{ padding:"12px 8px",fontFamily:"system-ui",fontSize:15,letterSpacing:"0.04em",cursor:avail?"pointer":"not-allowed",
                        textDecoration:!avail?"line-through":"none",
                        border:active?"1px solid oklch(0.75 0.15 85)":!avail?"1px solid oklch(0.22 0.02 60)":"1px solid oklch(0.3 0.03 75)",
                        background:active?"oklch(0.75 0.15 85 / 0.12)":!avail?"oklch(0.14 0.01 60)":"transparent",
                        color:active?"oklch(0.75 0.15 85)":!avail?"oklch(0.30 0.02 60)":"oklch(0.80 0.02 85)" }}>{t}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Lbl>Duration</Lbl>
            <div style={{ display:"flex",alignItems:"center",border:"1px solid oklch(0.3 0.03 75)",overflow:"hidden" }}>
              <button type="button" onClick={()=>setDurIdx(i=>Math.max(0,i-1))} disabled={durIdx===0}
                style={{ width:52,height:54,fontSize:24,fontFamily:"system-ui",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:"none",borderRight:"1px solid oklch(0.3 0.03 75)",background:"oklch(0.12 0.01 60)",color:durIdx===0?"oklch(0.4 0.02 75)":"oklch(0.75 0.15 85)",cursor:durIdx===0?"not-allowed":"pointer" }}>−</button>
              <span style={{ flex:1,textAlign:"center",fontFamily:"system-ui",fontSize:15,color:"oklch(0.92 0.04 85)",padding:"0 4px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>
                {DURATIONS[durIdx].label}
                {(DURATION_HOURS[DURATIONS[durIdx].value]??0) > remaining && " (insufficient hours)"}
              </span>
              <button type="button" onClick={()=>setDurIdx(i=>Math.min(DURATIONS.length-1,i+1))} disabled={durIdx===DURATIONS.length-1}
                style={{ width:52,height:54,fontSize:24,fontFamily:"system-ui",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:"none",borderLeft:"1px solid oklch(0.3 0.03 75)",background:"oklch(0.12 0.01 60)",color:durIdx===DURATIONS.length-1?"oklch(0.4 0.02 75)":"oklch(0.75 0.15 85)",cursor:durIdx===DURATIONS.length-1?"not-allowed":"pointer" }}>+</button>
            </div>
          </div>

          {error && <p style={{ fontFamily:"system-ui",fontSize:14,color:"oklch(0.65 0.2 25)",textAlign:"center" }}>{error}</p>}

          <button type="button" onClick={addToCart} disabled={!date||!timeSlot||remaining<=0}
            style={{ padding:"13px",border:"1px solid oklch(0.75 0.15 85 / 0.4)",background:"transparent",color:"oklch(0.75 0.15 85)",
              fontFamily:"system-ui",fontSize:14,letterSpacing:"0.12em",textTransform:"uppercase",cursor:"pointer",transition:"all 0.3s",
              opacity:(!date||!timeSlot||remaining<=0)?0.4:1 }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLButtonElement).style.background="oklch(0.75 0.15 85 / 0.1)"; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.background="transparent"; }}>
            + Add to Session Plan
          </button>

          {/* Cart */}
          {(cart.length > 0 || existingSlots.length > 0) && (
            <div style={{ borderTop:"1px solid oklch(0.22 0.02 75)", paddingTop:20 }}>
              <p style={{ fontFamily:"system-ui",fontSize:11,letterSpacing:"0.2em",textTransform:"uppercase",color:"oklch(0.55 0.03 75)",marginBottom:12 }}>
                Session Plan
              </p>

              {existingSlots.length > 0 && (
                <div style={{ marginBottom:12 }}>
                  <p style={{ fontFamily:"system-ui",fontSize:11,color:"oklch(0.45 0.02 75)",letterSpacing:"0.08em",marginBottom:8 }}>Already confirmed</p>
                  {existingSlots.map((s,i)=>(
                    <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"10px 12px",marginBottom:6,background:"oklch(0.10 0.01 60)",border:"1px solid oklch(0.18 0.01 60)" }}>
                      <span style={{ fontFamily:"system-ui",fontSize:13,color:"oklch(0.60 0.02 75)" }}>
                        {new Date(s.booking_date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short"})} · {s.time_slot} · {durationLabel[s.duration]??s.duration}
                      </span>
                      <span style={{ fontFamily:"system-ui",fontSize:11,color:"oklch(0.50 0.02 75)" }}>{DURATION_HOURS[s.duration]??0} hr</span>
                    </div>
                  ))}
                </div>
              )}

              {cart.map((s,i)=>(
                <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",marginBottom:6,border:"1px solid oklch(0.28 0.03 75)" }}>
                  <span style={{ fontFamily:"system-ui",fontSize:13,color:"oklch(0.80 0.02 85)" }}>
                    {new Date(s.booking_date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short"})} · {s.time_slot} · {durationLabel[s.duration]??s.duration}
                  </span>
                  <button onClick={()=>removeFromCart(i)} style={{ background:"none",border:"none",cursor:"pointer",color:"oklch(0.50 0.03 75)",fontSize:16,lineHeight:1 }}>✕</button>
                </div>
              ))}

              {cart.length > 0 && (
                <div style={{ marginTop:4, display:"flex",justifyContent:"space-between",fontFamily:"system-ui",fontSize:13,color:"oklch(0.65 0.03 75)",padding:"8px 0" }}>
                  <span>Adding {cartHours} hrs · {remaining} hrs will remain</span>
                </div>
              )}
            </div>
          )}

          {cart.length > 0 && (
            <button type="button" onClick={confirm} disabled={loading}
              style={{ width:"100%",padding:18,border:"1px solid oklch(0.75 0.15 85 / 0.5)",background:"transparent",color:"oklch(0.75 0.15 85)",
                fontFamily:"system-ui",fontSize:15,letterSpacing:"0.2em",textTransform:"uppercase",cursor:loading?"not-allowed":"pointer",opacity:loading?0.5:1,transition:"all 0.4s" }}
              onMouseEnter={e=>{ if(!loading){(e.currentTarget as HTMLButtonElement).style.background="oklch(0.75 0.15 85)";(e.currentTarget as HTMLButtonElement).style.color="oklch(0.08 0.01 60)";} }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.background="transparent";(e.currentTarget as HTMLButtonElement).style.color="oklch(0.75 0.15 85)"; }}>
              {loading?"Confirming…":`Confirm ${cart.length} Session${cart.length>1?"s":""}`}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return <p style={{ fontFamily:"system-ui",fontSize:13,fontWeight:500,letterSpacing:"0.12em",textTransform:"uppercase",color:"oklch(0.68 0.06 85)" }}>{children}</p>;
}
const IS: React.CSSProperties = { width:"100%",padding:"12px 14px",background:"transparent",border:"1px solid oklch(0.3 0.03 75)",color:"oklch(0.93 0.02 85)",fontFamily:"system-ui",fontSize:16,letterSpacing:"0.03em",outline:"none",transition:"border-color 0.2s",boxSizing:"border-box" };
