import { createClient } from "@/lib/supabase-server";
import { supabase as admin } from "@/lib/supabase";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/sign-out-button";
import CancelBookingButton from "@/components/cancel-booking-button";
import CancelBulkBookingButton from "@/components/cancel-bulk-booking-button";
import GoldenGlow from "@/components/golden-glow";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const today = new Date().toISOString().split("T")[0];

  const [{ data: bookings }, { data: bulkBookings }] = await Promise.all([
    admin.from("bookings").select("*").eq("user_id", user.id).order("booking_date", { ascending: true }),
    admin.from("bulk_bookings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  const upcoming = (bookings ?? []).filter((b) => b.booking_date >= today);
  const past     = (bookings ?? []).filter((b) => b.booking_date < today).reverse();

  const avatar = user.user_metadata?.avatar_url as string | undefined;
  const name   = (user.user_metadata?.full_name ?? user.email ?? "User") as string;
  const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <main className="min-h-screen w-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-border/30">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, letterSpacing: "0.05em" }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Home
        </Link>
        <span className="text-gold-gradient text-sm tracking-[0.2em] uppercase font-light">The Golden Mic</span>
        <SignOutButton />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 pb-20">

        {/* User info */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginBottom: 48 }}>
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={name} referrerPolicy="no-referrer"
              style={{ width: 80, height: 80, borderRadius: "50%",
                border: "2px solid oklch(0.75 0.15 85 / 0.5)", objectFit: "cover" }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: "50%",
              background: "oklch(0.75 0.15 85 / 0.12)", border: "2px solid oklch(0.75 0.15 85 / 0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "oklch(0.75 0.15 85)", fontFamily: "system-ui", fontSize: 28, fontWeight: 500 }}>
              {initials}
            </div>
          )}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300,
              letterSpacing: "0.08em", color: "oklch(0.92 0.02 85)" }}>{name}</p>
            <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, color: "oklch(0.50 0.03 75)",
              letterSpacing: "0.04em", marginTop: 4 }}>{user.email}</p>
          </div>
          <GoldenGlow>
            <Link href="/booking"
              style={{ display: "inline-block", marginTop: 4, padding: "11px 28px", border: "1px solid oklch(0.75 0.15 85 / 0.5)",
                color: "oklch(0.75 0.15 85)", fontFamily: "system-ui, sans-serif", fontSize: 13,
                letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", transition: "all 0.3s" }}>
              + Book a Slot
            </Link>
          </GoldenGlow>
        </div>

        {/* Bulk booking plans */}
        {(bulkBookings ?? []).length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontFamily: "system-ui", fontSize: 11, fontWeight: 600, letterSpacing: "0.2em",
              textTransform: "uppercase", color: "oklch(0.65 0.12 85)", marginBottom: 16 }}>Bulk Plans</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(bulkBookings ?? []).map((bb) => {
                const typeLabel = bb.booking_type === "karaoke_singer" ? "Karaoke Singer" : "Live Rehearsal";
                const remaining = bb.total_hours - bb.used_hours;
                const pct = (remaining / bb.total_hours) * 100;
                const isCancelled = !!bb.cancelled_at;
                const statusLabel = isCancelled ? "Cancelled" : bb.payment_complete ? "Active" : "Pending";
                const statusColor = isCancelled ? "oklch(0.65 0.2 25)" : bb.payment_complete ? "oklch(0.65 0.18 145)" : "oklch(0.72 0.12 85)";
                return (
                  <div key={bb.id}
                    style={{ border: "1px solid oklch(0.28 0.03 75)", padding: "18px 20px",
                      display: "flex", flexDirection: "column", gap: 10,
                      background: "transparent", opacity: isCancelled ? 0.6 : 1 }}>
                    <Link href={`/bulk-booking/${bb.id}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <p style={{ fontFamily: "system-ui", fontSize: 15, fontWeight: 600, color: "oklch(0.88 0.02 85)" }}>Bulk · {typeLabel}</p>
                          <p style={{ fontFamily: "system-ui", fontSize: 12, color: "oklch(0.50 0.03 75)", marginTop: 3, letterSpacing: "0.04em" }}>
                            {new Date(bb.start_date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})} → {new Date(bb.end_date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                          </p>
                        </div>
                        <div style={{ padding: "4px 12px", fontFamily: "system-ui", fontSize: 11, letterSpacing: "0.12em",
                          textTransform: "uppercase", border: `1px solid ${statusColor.replace(")", " / 0.5)")}`,
                          color: statusColor }}>
                          {statusLabel}
                        </div>
                      </div>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "system-ui", fontSize: 12,
                          color: "oklch(0.60 0.03 75)", marginBottom: 6 }}>
                          <span>{remaining} hrs remaining</span><span>{bb.total_hours} hrs total</span>
                        </div>
                        <div style={{ height: 4, background: "oklch(0.20 0.02 60)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", background: "oklch(0.75 0.15 85)", borderRadius: 2, width: `${pct}%` }}/>
                        </div>
                      </div>
                      {bb.payment_complete && !isCancelled && (
                        <p style={{ fontFamily: "system-ui", fontSize: 12, color: "oklch(0.65 0.10 85)", letterSpacing: "0.06em" }}>
                          Click to book sessions →
                        </p>
                      )}
                    </Link>
                    {!isCancelled && bb.payment_complete && (
                      <div>
                        <CancelBulkBookingButton
                          bulkBookingId={bb.id}
                          startDate={bb.start_date}
                          amountPaid={bb.amount_paid ?? 0}
                          usedHours={bb.used_hours ?? 0}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming bookings */}
        <BookingSection title="Upcoming" bookings={upcoming} empty="No upcoming bookings." accent allowCancel />

        {/* Past bookings */}
        <BookingSection title="Past Bookings" bookings={past} empty="No past bookings yet." />
      </div>
    </main>
  );
}

type Booking = {
  id: string;
  booking_date: string;
  time_slot: string;
  duration: string;
  studio: string;
  people_count: number;
  payment_complete: boolean;
  payment_status: string | null;
  amount_paid: number | null;
  txn_id: string | null;
};

function BookingSection({ title, bookings, empty, accent, allowCancel }: {
  title: string; bookings: Booking[]; empty: string; accent?: boolean; allowCancel?: boolean;
}) {
  return (
    <div style={{ marginBottom: 40 }}>
      <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 11, fontWeight: 600,
        letterSpacing: "0.2em", textTransform: "uppercase",
        color: accent ? "oklch(0.75 0.15 85)" : "oklch(0.45 0.03 75)", marginBottom: 16 }}>
        {title}
      </p>
      {bookings.length === 0 ? (
        <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 14, color: "oklch(0.40 0.02 75)",
          letterSpacing: "0.04em", padding: "24px 0" }}>{empty}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {bookings.map((b) => <BookingCard key={b.id} booking={b} dim={!accent} allowCancel={allowCancel} />)}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking: b, dim, allowCancel }: { booking: Booking; dim?: boolean; allowCancel?: boolean }) {
  const date = new Date(b.booking_date + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "long", year: "numeric"
  });
  const durationLabel: Record<string, string> = {
    "1Hr": "1 Hour", "2Hr": "2 Hours", "3Hr": "3 Hours",
    "HalfDay": "Half Day (4.5 Hrs)", "FullDay": "Full Day (9 Hrs)"
  };
  const isCancelled = b.payment_status === "cancelled";
  const statusLabel = isCancelled ? "Cancelled" : b.payment_status === "rejected" ? "Rejected" : b.payment_complete ? "Confirmed" : "Pending";
  const statusColor = isCancelled || b.payment_status === "rejected" ? "oklch(0.65 0.2 25)" : b.payment_complete ? "oklch(0.65 0.18 145)" : "oklch(0.72 0.12 85)";

  return (
    <div style={{
      border: `1px solid ${dim ? "oklch(0.18 0.01 60)" : "oklch(0.28 0.03 75)"}`,
      background: dim ? "oklch(0.09 0.01 60)" : "transparent",
      padding: "18px 20px", opacity: dim ? 0.65 : 1,
      display: "flex", flexDirection: "column", gap: 14,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 15, fontWeight: 600,
            color: "oklch(0.88 0.02 85)", letterSpacing: "0.02em" }}>{date}</p>
          <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, color: "oklch(0.60 0.03 75)", letterSpacing: "0.04em" }}>
            {b.time_slot} · {durationLabel[b.duration] ?? b.duration}
          </p>
          <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, color: "oklch(0.55 0.03 75)", letterSpacing: "0.04em" }}>
            {b.studio} · {b.people_count} {b.people_count === 1 ? "person" : "people"}
          </p>
        </div>
        <div style={{
          padding: "4px 12px", fontSize: 11, fontFamily: "system-ui, sans-serif",
          letterSpacing: "0.12em", textTransform: "uppercase",
          border: `1px solid ${statusColor.replace(")", " / 0.5)")}`,
          color: statusColor,
          background: statusColor.replace(")", " / 0.07)"),
          whiteSpace: "nowrap",
        }}>
          {statusLabel}
        </div>
      </div>

      {allowCancel && !isCancelled && b.payment_status !== "rejected" && (
        <div>
          <CancelBookingButton
            bookingId={b.id}
            bookingDate={b.booking_date}
            timeSlot={b.time_slot}
            amountPaid={b.amount_paid ?? 0}
          />
        </div>
      )}
    </div>
  );
}
