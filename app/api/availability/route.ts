import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { occupiedHours } from "@/lib/booking-utils";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studio = searchParams.get("studio");
  const date   = searchParams.get("date");

  if (!studio || !date)
    return NextResponse.json({ error: "studio and date are required" }, { status: 400 });

  const [{ data: reg }, { data: bulk }] = await Promise.all([
    supabase.from("bookings").select("time_slot,duration").eq("studio", studio).eq("booking_date", date),
    supabase.from("bulk_slots").select("time_slot,duration").eq("studio", studio).eq("booking_date", date),
  ]);

  const taken = occupiedHours([...(reg ?? []), ...(bulk ?? [])]);
  return NextResponse.json({ occupiedHours: taken });
}
