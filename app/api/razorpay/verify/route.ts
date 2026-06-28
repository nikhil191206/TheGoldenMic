import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase-server";
import { occupiedHours, hasConflict } from "@/lib/booking-utils";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !booking) {
      return NextResponse.json({ error: "Missing payment verification data" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    const userId = user?.id ?? null;

    const {
      name, gender, age, phone, email, people_count,
      singer_idol, booking_date, time_slot, duration, studio, amount_paid,
    } = booking;

    if (!name || !gender || !age || !phone || !email || !people_count ||
        !booking_date || !time_slot || !duration || !studio) {
      return NextResponse.json({ error: "Missing required booking fields" }, { status: 400 });
    }

    // Same slot-conflict guard as the manual flow. Payment is already
    // captured by this point — a clash here means a refund has to be
    // issued manually from the Razorpay dashboard.
    const { data: existing, error: fetchError } = await supabase
      .from("bookings")
      .select("time_slot, duration")
      .eq("studio", studio)
      .eq("booking_date", booking_date);

    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

    const taken = occupiedHours(existing ?? []);
    if (hasConflict(time_slot, duration, taken)) {
      return NextResponse.json(
        {
          error: "Payment succeeded but this slot was just taken by someone else. Contact us for a refund.",
          paymentId: razorpay_payment_id,
        },
        { status: 409 }
      );
    }

    const { error } = await supabase.from("bookings").insert({
      name, gender, age: Number(age),
      phone, email, people_count: Number(people_count),
      singer_idol: singer_idol || null,
      booking_date, time_slot, duration, studio,
      txn_id: razorpay_payment_id,
      txn_screenshot_url: null,
      amount_paid: amount_paid ? Number(amount_paid) : null,
      payment_status: "confirmed",
      user_id: userId,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
