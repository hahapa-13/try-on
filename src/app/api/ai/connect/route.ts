import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const provider: string = (body.provider ?? "").trim();
    const apiKey: string = (body.apiKey ?? "").trim();

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: "provider and apiKey are required." },
        { status: 400 }
      );
    }

    const { error: upsertError } = await supabase
      .from("ai_connections")
      .upsert(
        {
          user_id: user.id,
          provider,
          encrypted_key: apiKey,
          is_connected: true,
          is_default: true,
        },
        { onConflict: "user_id,provider" }
      );

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[POST /api/ai/connect]", err);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}