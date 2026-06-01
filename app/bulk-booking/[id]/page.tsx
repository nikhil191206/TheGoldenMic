import { createClient } from "@/lib/supabase-server";
import { supabase as admin } from "@/lib/supabase";
import { redirect } from "next/navigation";
import BulkSlotCart from "@/components/bulk-slot-cart";

export default async function BulkSlotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: bb } = await admin
    .from("bulk_bookings")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!bb) redirect("/profile");

  const { data: existingSlots } = await admin
    .from("bulk_slots")
    .select("*")
    .eq("bulk_booking_id", id)
    .order("booking_date", { ascending: true });

  return <BulkSlotCart bulkBooking={bb} existingSlots={existingSlots ?? []} />;
}
