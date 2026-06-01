import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase-server";
import { occupiedHours, hasConflict } from "@/lib/booking-utils";
import { DURATION_HOURS } from "@/lib/pricing";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { bulk_booking_id, slots } = await req.json();
    // slots: Array<{ booking_date, time_slot, duration, studio }>

    if (!bulk_booking_id || !Array.isArray(slots) || slots.length === 0)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    // Fetch the bulk booking and verify ownership
    const { data: bb, error: bbErr } = await supabase
      .from("bulk_bookings")
      .select("*")
      .eq("id", bulk_booking_id)
      .eq("user_id", user.id)
      .single();

    if (bbErr || !bb) return NextResponse.json({ error: "Bulk booking not found" }, { status: 404 });
    if (!bb.payment_complete) return NextResponse.json({ error: "Payment not yet confirmed by admin" }, { status: 403 });

    const totalNewHours = slots.reduce((s: number, sl: { duration: string }) => s + (DURATION_HOURS[sl.duration] ?? 0), 0);
    const remaining = bb.total_hours - bb.used_hours;

    if (totalNewHours > remaining)
      return NextResponse.json({ error: `Only ${remaining} hours remaining in your plan` }, { status: 409 });

    // Check all slots are within the date range
    for (const sl of slots) {
      if (sl.booking_date < bb.start_date || sl.booking_date > bb.end_date)
        return NextResponse.json({ error: `Date ${sl.booking_date} is outside your plan window (${bb.start_date} – ${bb.end_date})` }, { status: 409 });
    }

    // Check availability for each slot (regular bookings + existing bulk slots)
    for (const sl of slots) {
      const [{ data: reg }, { data: bulkSl }] = await Promise.all([
        supabase.from("bookings").select("time_slot,duration").eq("studio", sl.studio).eq("booking_date", sl.booking_date),
        supabase.from("bulk_slots").select("time_slot,duration").eq("studio", sl.studio).eq("booking_date", sl.booking_date),
      ]);
      const taken = occupiedHours([...(reg ?? []), ...(bulkSl ?? [])]);
      if (hasConflict(sl.time_slot, sl.duration, taken))
        return NextResponse.json({ error: `Slot ${sl.time_slot} on ${sl.booking_date} is already booked` }, { status: 409 });
    }

    // Insert all slots
    const { error: insertErr } = await supabase.from("bulk_slots").insert(
      slots.map((sl: { booking_date: string; time_slot: string; duration: string; studio: string }) => ({
        bulk_booking_id, user_id: user.id,
        booking_date: sl.booking_date, time_slot: sl.time_slot,
        duration: sl.duration, studio: sl.studio,
        hours_used: DURATION_HOURS[sl.duration] ?? 0,
      }))
    );
    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

    // Update used_hours
    const { error: updateErr } = await supabase
      .from("bulk_bookings")
      .update({ used_hours: bb.used_hours + totalNewHours })
      .eq("id", bulk_booking_id);
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
