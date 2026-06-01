import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { occupiedHours, hasConflict } from "@/lib/booking-utils";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { name, gender, age, singer_idol, booking_date, time_slot, duration, studio } =
      await req.json();

    if (!name || !gender || !age || !booking_date || !time_slot || !duration || !studio) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ── Concurrency check: fetch existing bookings for this studio + date ──
    const { data: existing, error: fetchError } = await supabase
      .from("bookings")
      .select("time_slot, duration")
      .eq("studio", studio)
      .eq("booking_date", booking_date);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const taken = occupiedHours(existing ?? []);

    if (hasConflict(time_slot, duration, taken)) {
      return NextResponse.json(
        { error: "This time slot is already booked. Please choose a different time or studio." },
        { status: 409 }
      );
    }

    // ── Insert ──
    const { error } = await supabase.from("bookings").insert({
      name,
      gender,
      age: Number(age),
      singer_idol: singer_idol || null,
      booking_date,
      time_slot,
      duration,
      studio,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
