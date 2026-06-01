import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
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
  } catch (err) {
    console.error("Booking insert error:", err);
    return NextResponse.json({ error: "Failed to save booking" }, { status: 500 });
  }
}
