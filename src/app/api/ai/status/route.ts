import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ connected: false });
  }

  const { data } = await supabase
    .from("ai_connections")
    .select("id")
    .eq("user_id", user.id)
    .eq("provider", "gemini")
    .eq("is_connected", true)
    .maybeSingle();

  return NextResponse.json({ connected: !!data });
}