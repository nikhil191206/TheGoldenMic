import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { booking_type, people_count, start_date, end_date, amount_paid,
            name, phone, email, txn_id, txn_screenshot_url } = await req.json();

    if (!booking_type || !people_count || !start_date || !end_date)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    if (!txn_id && !txn_screenshot_url)
      return NextResponse.json({ error: "Payment proof required" }, { status: 400 });

    const { error } = await supabase.from("bulk_bookings").insert({
      user_id: user.id, booking_type, people_count: Number(people_count),
      start_date, end_date, total_hours: 30, used_hours: 0,
      amount_paid: Number(amount_paid), name, phone, email,
      txn_id: txn_id || null, txn_screenshot_url: txn_screenshot_url || null,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
