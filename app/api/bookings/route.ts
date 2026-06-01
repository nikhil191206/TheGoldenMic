import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL is not set — add it in Vercel Environment Variables" },
      { status: 500 }
    );
  }

  try {
    const { name, gender, age, singer_idol, booking_date, time_slot, duration, studio } =
      await req.json();

    if (!name || !gender || !age || !booking_date || !time_slot || !duration || !studio) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await pool.query(
      `INSERT INTO bookings (name, gender, age, singer_idol, booking_date, time_slot, duration, studio)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [name, gender, Number(age), singer_idol || null, booking_date, time_slot, duration, studio]
    );

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Booking insert error:", message);
    // Return the real DB error so it's visible in the form
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
