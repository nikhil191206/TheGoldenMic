import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: "File too large. Max 5 MB." }, { status: 400 });

    const ext      = file.name.split(".").pop() ?? "jpg";
    const fileName = `${Date.now()}.${ext}`;
    const buffer   = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage
      .from("txn-screenshots")
      .upload(fileName, buffer, { contentType: file.type, upsert: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: { publicUrl } } = supabase.storage
      .from("txn-screenshots")
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
