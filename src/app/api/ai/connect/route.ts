import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { encryptApiKey, decryptApiKey } from "@/lib/ai/crypto";
import { validateReplicateKey } from "@/lib/ai/replicate";

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("ai_connections")
      .select("is_connected, is_default, encrypted_key")
      .eq("user_id", user.id)
      .eq("provider", "replicate")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ connected: false, isDefault: false, keyHint: null });
    }

    let keyHint: string = "••••";
    try {
      const plain = decryptApiKey(data.encrypted_key);
      keyHint = "••••" + plain.slice(-4);
    } catch {
      // Non-fatal — hint is cosmetic only
    }

    return NextResponse.json({
      connected: data.is_connected,
      isDefault: data.is_default,
      keyHint,
    });
  } catch (err: unknown) {
    console.error("[GET /api/ai/connect]", err);
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}

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
    const apiKey: string = (body.apiKey ?? "").trim();

    if (!apiKey) {
      return NextResponse.json({ error: "apiKey is required." }, { status: 400 });
    }

    const isValid = await validateReplicateKey(apiKey);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid Replicate API key. Please check your key at replicate.com/account." },
        { status: 422 }
      );
    }

    const encryptedKey = encryptApiKey(apiKey);

    const { error: upsertError } = await supabase
      .from("ai_connections")
      .upsert(
        {
          user_id: user.id,
          provider: "replicate",
          encrypted_key: encryptedKey,
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
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}

export async function DELETE(): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { error } = await supabase
      .from("ai_connections")
      .delete()
      .eq("user_id", user.id)
      .eq("provider", "replicate");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[DELETE /api/ai/connect]", err);
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}