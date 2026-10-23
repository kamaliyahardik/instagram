import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/client";

export async function GET() {
  try {
    const db = await supabaseServer();
    const { data: { user } } = await db.auth.getUser();
    if (!user) return NextResponse.json({ success: true, history: [] });
    const { data } = await db
      .from("downloads")
      .select("id, source_url, platform, content_type, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    return NextResponse.json({ success: true, history: data ?? [] });
  } catch {
    return NextResponse.json({ success: true, history: [] });
  }
}
