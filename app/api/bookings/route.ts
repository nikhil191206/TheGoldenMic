import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { name, gender, age, singer_idol, booking_date, time_slot, duration, studio } =
      await req.json();

    if (!name || !gender || !age || !booking_date || !time_slot || !duration || !studio) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

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
      console.error("Supabase insert error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Booking error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
