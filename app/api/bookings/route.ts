import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { occupiedHours, hasConflict } from "@/lib/booking-utils";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const {
      name, gender, age, phone, email, people_count,
      singer_idol, booking_date, time_slot, duration, studio,
      txn_id, txn_screenshot_url,
    } = await req.json();

    if (!name || !gender || !age || !phone || !email || !people_count ||
        !booking_date || !time_slot || !duration || !studio) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!txn_id && !txn_screenshot_url) {
      return NextResponse.json({ error: "Payment proof is required" }, { status: 400 });
    }

    // Concurrency check
    const { data: existing, error: fetchError } = await supabase
      .from("bookings")
      .select("time_slot, duration")
      .eq("studio", studio)
      .eq("booking_date", booking_date);

    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

    const taken = occupiedHours(existing ?? []);
    if (hasConflict(time_slot, duration, taken)) {
      return NextResponse.json(
        { error: "This time slot is already booked. Please choose a different time or studio." },
        { status: 409 }
      );
    }

    const { error } = await supabase.from("bookings").insert({
      name, gender, age: Number(age),
      phone, email, people_count: Number(people_count),
      singer_idol: singer_idol || null,
      booking_date, time_slot, duration, studio,
      txn_id: txn_id || null,
      txn_screenshot_url: txn_screenshot_url || null,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
