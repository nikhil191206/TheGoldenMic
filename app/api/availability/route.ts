import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { occupiedHours } from "@/lib/booking-utils";

export const runtime = "nodejs";

// GET /api/availability?studio=Studio-1&date=2026-06-02
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studio = searchParams.get("studio");
  const date   = searchParams.get("date");

  if (!studio || !date) {
    return NextResponse.json({ error: "studio and date are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("time_slot, duration")
    .eq("studio", studio)
    .eq("booking_date", date);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ occupiedHours: occupiedHours(data ?? []) });
}
