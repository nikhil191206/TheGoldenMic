"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { BULK_PLANS, applyTransactionFee, fmt } from "@/lib/pricing";
import GoldenGlow from "@/components/golden-glow";

type Plan = (typeof BULK_PLANS)[number];

function BulkBookingForm() {
  const searchParams = useSearchParams();
  const planParam    = searchParams.get("plan") ?? "";
  const router = useRouter();
  const [selected, setSelected] = useState<Plan | null>(
    BULK_PLANS.find(p => p.value === planParam) ?? null
  );
  const [form, setForm]         = useState({ name:"", phone:"", email:"", people_count:"", start_date:"" });
  const [txnId, setTxnId]       = useState("");
  const [txnFile, setTxnFile]   = useState<File | null>(null);
  const [txnScreenshotUrl, setTxnScreenshotUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const endDate = (start: string) => {
    if (!start) return "";
    const d = new Date(start + "T00:00:00");
    d.setMonth(d.getMonth() + 2);
    return d.toISOString().split("T")[0];
  };

  const handleFileSelect = async (file: File) => {
    setTxnFile(file);
    setTxnScreenshotUrl("");
    setUploading(true);
    setError("");
    const fd = new FormData(); fd.append("file", file);
    const up = await fetch("/api/upload", { method: "POST", body: fd });
    if (!up.ok) { setError((await up.json()).error ?? "Upload failed."); setUploading(false); return; }
    setTxnScreenshotUrl((await up.json()).url);
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!selected) return;
    if (!form.name || !form.phone || !form.email || !form.people_count || !form.start_date) {
      setError("Please fill all fields."); return;
    }
    if (!txnId && !txnFile) { setError("Please enter a Transaction ID or upload a screenshot."); return; }
    if (txnFile && uploading) { setError("Screenshot is still uploading, please wait a moment."); return; }
    setLoading(true); setError("");

    const { total } = applyTransactionFee(selected.discountedPrice);
    const res = await fetch("/api/bulk-bookings", {
      method: "POST", headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ ...form, people_count: parseInt(form.people_count),
        booking_type: selected.value, amount_paid: total,
        start_date: form.start_date, end_date: endDate(form.start_date),
        txn_id: txnId || null, txn_screenshot_url: txnScreenshotUrl || null }),
    });
    if (!res.ok) { setError((await res.json()).error ?? "Booking failed."); setLoading(false); return; }
    setSuccess(true); setLoading(false);
  };

  if (success) return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div style={{ textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:24, maxWidth:380 }}>
        <div style={{ fontSize:52 }}>🎤</div>
        <h2 className="text-gold-gradient font-light" style={{ fontSize:"clamp(2rem,8vw,2.8rem)", letterSpacing:"0.08em" }}>Bulk Plan Purchased!</h2>
        <p style={{ fontFamily:"system-ui", fontSize:15, color:"oklch(0.65 0.03 85)", lineHeight:1.7 }}>
          Your 30-hour plan is confirmed. Visit your profile to start booking sessions within your 2-month window.
        </p>
        <Link href="/profile" style={{ padding:"12px 28px", border:"1px solid oklch(0.75 0.15 85 / 0.5)", color:"oklch(0.75 0.15 85)",
          fontFamily:"system-ui", fontSize:13, letterSpacing:"0.15em", textTransform:"uppercase", textDecoration:"none" }}>
          Go to My Profile
        </Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen w-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-border/30">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          style={{ fontFamily:"system-ui", fontSize:13, letterSpacing:"0.05em" }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 12H5M12 5l-7 7 7 7"/></svg>Back
        </Link>
        <span className="text-gold-gradient uppercase font-light" style={{ fontSize:"clamp(0.65rem,2.5vw,0.875rem)", letterSpacing:"0.15em" }}>The Golden Mic</span>
        <div className="w-16"/>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 pb-24">
        <h1 className="text-gold-gradient font-light text-center mb-2" style={{ fontSize:"clamp(2rem,7vw,3rem)", letterSpacing:"0.1em" }}>Bulk Booking Plans</h1>
        <p className="text-center text-muted-foreground mb-10" style={{ fontFamily:"system-ui", fontSize:14, letterSpacing:"0.06em" }}>
          Pre-purchase 30 hours over 2 months with an 11% discount. Book sessions any day within your window.
        </p>

        {/* Plan cards */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:32 }}>
          {BULK_PLANS.map(plan => {
            const active = selected?.value === plan.value;
            return (
              <div key={plan.value} onClick={()=>{ setSelected(plan); setError(""); }}
                style={{ border: active?"2px solid oklch(0.75 0.15 85)":"1px solid oklch(0.28 0.03 75)",
                  background: active?"oklch(0.75 0.15 85 / 0.06)":"transparent",
                  padding:"24px 20px", cursor:"pointer", transition:"all 0.25s", display:"flex", flexDirection:"column", gap:12 }}>
                <p style={{ fontFamily:"system-ui", fontSize:15, fontWeight:700, color: active?"oklch(0.80 0.15 85)":"oklch(0.88 0.02 85)", letterSpacing:"0.02em" }}>
                  {plan.value === "karaoke_singer" ? "Karaoke Singers" : "Live Rehearsal"}
                </p>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {[
                    ["Duration", `${plan.hours} hrs in ${plan.months} months`],
                    ["Max Participants", `${plan.maxPeople} people`],
                  ].map(([k,v])=>(
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", fontFamily:"system-ui", fontSize:12, color:"oklch(0.60 0.02 75)" }}>
                      <span>{k}</span><span style={{ color:"oklch(0.75 0.03 85)" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop:"1px solid oklch(0.22 0.02 75)", paddingTop:12, marginTop:4 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"system-ui", fontSize:12, color:"oklch(0.45 0.02 75)", marginBottom:4 }}>
                    <span>Base price</span>
                    <span style={{ textDecoration:"line-through" }}>{fmt(plan.basePrice)}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"system-ui", fontSize:12, color:"oklch(0.65 0.15 145)" }}>
                    <span>{plan.discount} discount</span>
                    <span>−{fmt(plan.saving)}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, fontFamily:"system-ui", fontWeight:700 }}>
                    <span style={{ fontSize:13, color:"oklch(0.88 0.02 85)" }}>You pay</span>
                    <span style={{ fontSize:20, color:"oklch(0.75 0.15 85)" }}>{fmt(plan.discountedPrice)}</span>
                  </div>
                </div>
                {active && (
                  <div style={{ padding:"6px 12px", background:"oklch(0.75 0.15 85 / 0.12)", border:"1px solid oklch(0.75 0.15 85 / 0.4)",
                    textAlign:"center", fontFamily:"system-ui", fontSize:11, color:"oklch(0.80 0.15 85)", letterSpacing:"0.1em", textTransform:"uppercase" }}>
                    Selected ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Form — shown when a plan is selected */}
        {selected && (
          <div style={{ display:"flex", flexDirection:"column", gap:20, borderTop:"1px solid oklch(0.22 0.02 75)", paddingTop:32 }}>
            <h2 style={{ fontFamily:"system-ui", fontSize:16, fontWeight:600, color:"oklch(0.88 0.02 85)", letterSpacing:"0.04em" }}>
              Your Details
            </h2>

            <F label="Name"><input type="text" placeholder="Full name" value={form.name} onChange={e=>set("name",e.target.value)} style={IS}/></F>
            <F label="Phone"><input type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e=>set("phone",e.target.value)} style={IS}/></F>
            <F label="Email"><input type="email" placeholder="your@email.com" value={form.email} onChange={e=>set("email",e.target.value)} style={IS}/></F>
            <F label={`Number of Participants (max ${selected.maxPeople})`}>
              <input type="number" min={1} max={selected.maxPeople} placeholder={`1–${selected.maxPeople}`}
                value={form.people_count} onChange={e=>set("people_count",e.target.value)} style={IS}/>
            </F>
            <F label="Start Date (30-hour window begins)">
              <input type="date" value={form.start_date} min={new Date().toISOString().split("T")[0]}
                onChange={e=>set("start_date",e.target.value)} style={{ ...IS, colorScheme:"dark" }}/>
              {form.start_date && (
                <p style={{ fontFamily:"system-ui", fontSize:12, color:"oklch(0.60 0.10 85)", marginTop:6, letterSpacing:"0.04em" }}>
                  Valid: {new Date(form.start_date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})} →{" "}
                  {new Date(endDate(form.start_date)+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}
                </p>
              )}
            </F>

            {/* Amount */}
            <div style={{ padding:"14px 16px", background:"oklch(0.10 0.01 60)", border:"1px solid oklch(0.75 0.15 85 / 0.3)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"system-ui", fontSize:13, color:"oklch(0.72 0.02 85)", marginBottom:6 }}>
                <span>Plan price</span><span>{fmt(selected.discountedPrice)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"system-ui", fontSize:13, color:"oklch(0.72 0.02 85)", marginBottom:10 }}>
                <span>Payment processing fee (2%)</span><span>{fmt(applyTransactionFee(selected.discountedPrice).fee)}</span>
              </div>
              <div style={{ borderTop:"1px solid oklch(0.25 0.02 75)", paddingTop:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontFamily:"system-ui", fontSize:14, fontWeight:600, color:"oklch(0.88 0.02 85)" }}>Amount to Pay</span>
                <span style={{ fontFamily:"system-ui", fontSize:22, fontWeight:700, color:"oklch(0.75 0.15 85)" }}>{fmt(applyTransactionFee(selected.discountedPrice).total)}</span>
              </div>
            </div>

            {/* QR */}
            <div style={{ display:"flex", justifyContent:"center", marginTop:4 }}>
              <div style={{ padding:14, background:"#ffffff", border:"2px solid oklch(0.75 0.15 85)",
                boxShadow:"0 0 0 1px oklch(0.75 0.15 85 / 0.15), 0 0 28px oklch(0.75 0.15 85 / 0.25)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/payment_qr.jpeg" alt="Payment QR" style={{ width:200, height:200, display:"block", objectFit:"contain" }}/>
              </div>
            </div>
            <p style={{ fontFamily:"system-ui", fontSize:13, color:"oklch(0.50 0.03 75)", textAlign:"center", letterSpacing:"0.04em" }}>
              Scan QR · Pay {fmt(applyTransactionFee(selected.discountedPrice).total)} · Share proof below
            </p>

            <F label="Transaction ID / UTR Number">
              <input type="text" placeholder="Enter after payment" value={txnId} onChange={e=>setTxnId(e.target.value)} style={IS}/>
            </F>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ flex:1, height:1, background:"oklch(0.25 0.02 75)" }}/>
              <span style={{ fontFamily:"system-ui", fontSize:12, color:"oklch(0.45 0.03 75)", letterSpacing:"0.15em", textTransform:"uppercase" }}>OR</span>
              <div style={{ flex:1, height:1, background:"oklch(0.25 0.02 75)" }}/>
            </div>
            <div>
              <Lbl>Payment Screenshot</Lbl>
              <label style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, padding:"24px 16px", marginTop:8,
                border:txnFile?"1px solid oklch(0.75 0.15 85)":"1px dashed oklch(0.3 0.03 75)",
                background:txnFile?"oklch(0.75 0.15 85 / 0.05)":"transparent", cursor:"pointer", transition:"all 0.25s" }}>
                <input type="file" accept="image/*" className="sr-only" onChange={e=>{ const f=e.target.files?.[0]; if(f) handleFileSelect(f); }}/>
                {uploading
                  ? <span style={{ fontFamily:"system-ui", fontSize:14, color:"oklch(0.65 0.10 85)" }}>Uploading…</span>
                  : txnFile && txnScreenshotUrl
                  ? <span style={{ fontFamily:"system-ui", fontSize:14, color:"oklch(0.75 0.15 85)" }}>✓ {txnFile.name}</span>
                  : <span style={{ fontFamily:"system-ui", fontSize:14, color:"oklch(0.55 0.03 75)" }}>Upload payment screenshot</span>}
              </label>
            </div>

            {error && <p style={{ fontFamily:"system-ui", fontSize:14, color:"oklch(0.65 0.2 25)", textAlign:"center" }}>{error}</p>}
            <GBtn onClick={handleSubmit} disabled={loading || uploading}>
              {loading ? "Confirming…" : uploading ? "Uploading screenshot…" : "Confirm Bulk Purchase"}
            </GBtn>
          </div>
        )}
      </div>
    </main>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return <p style={{ fontFamily:"system-ui", fontSize:13, fontWeight:500, letterSpacing:"0.12em", textTransform:"uppercase", color:"oklch(0.68 0.06 85)" }}>{children}</p>;
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Lbl>{label}</Lbl>{children}</div>;
}
function GBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick?:()=>void; disabled?:boolean }) {
  return (
    <GoldenGlow>
      <button type="button" onClick={onClick} disabled={disabled}
        style={{ width:"100%", padding:18, border:"1px solid oklch(0.75 0.15 85 / 0.5)", background:"transparent",
          color:"oklch(0.75 0.15 85)", fontFamily:"system-ui", fontSize:15, letterSpacing:"0.2em", textTransform:"uppercase",
          cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.5:1, transition:"all 0.4s" }}>
        {children}
      </button>
    </GoldenGlow>
  );
}
export default function BulkBookingPage() {
  return <Suspense><BulkBookingForm /></Suspense>;
}

const IS: React.CSSProperties = {
  width:"100%", padding:"12px 14px", background:"transparent",
  border:"1px solid oklch(0.3 0.03 75)", color:"oklch(0.93 0.02 85)",
  fontFamily:"system-ui", fontSize:16, letterSpacing:"0.03em", outline:"none",
  transition:"border-color 0.2s", boxSizing:"border-box",
};
