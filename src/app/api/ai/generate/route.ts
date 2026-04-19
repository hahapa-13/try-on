import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { decryptApiKey } from "@/lib/ai/crypto";
import { startVtonPrediction } from "@/lib/ai/replicate";
import { isOwnSupabaseUrl, extractStoragePath } from "@/lib/ai/storage";

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
    const avatarUrl: string = (body.avatarUrl ?? "").trim();
    const clothingUrl: string = (body.clothingUrl ?? "").trim();

    if (!avatarUrl || !clothingUrl) {
      return NextResponse.json(
        { error: "avatarUrl and clothingUrl are required." },
        { status: 400 }
      );
    }

    if (!isOwnSupabaseUrl(avatarUrl)) {
      return NextResponse.json(
        { error: "avatarUrl must be a Supabase Storage URL. Please upload your avatar first." },
        { status: 422 }
      );
    }

    if (!isOwnSupabaseUrl(clothingUrl)) {
      return NextResponse.json(
        { error: "clothingUrl must be a Supabase Storage URL. Please save the clothing item first." },
        { status: 422 }
      );
    }

    const { data: connection, error: connError } = await supabase
      .from("ai_connections")
      .select("encrypted_key, is_connected")
      .eq("user_id", user.id)
      .eq("provider", "replicate")
      .eq("is_default", true)
      .maybeSingle();

    if (connError) {
      return NextResponse.json({ error: connError.message }, { status: 500 });
    }

    if (!connection || !connection.is_connected) {
      return NextResponse.json(
        { error: "No Replicate API key connected. Please add your key in Settings → AI." },
        { status: 422 }
      );
    }

    let apiKey: string;
    try {
      apiKey = decryptApiKey(connection.encrypted_key);
    } catch {
      return NextResponse.json(
        { error: "Failed to decrypt your API key. Please reconnect your Replicate account." },
        { status: 500 }
      );
    }

    // Store bucket-relative paths in DB, not full public URLs
    const avatarPath = extractStoragePath(avatarUrl);
    const clothingPath = extractStoragePath(clothingUrl);

    const { data: job, error: jobInsertError } = await supabase
      .from("generation_jobs")
      .insert({
        user_id: user.id,
        provider: "replicate",
        status: "pending",
        input_avatar_path: avatarPath,
        input_clothing_path: clothingPath,
      })
      .select("id")
      .single();

    if (jobInsertError || !job) {
      return NextResponse.json({ error: "Failed to create generation job." }, { status: 500 });
    }

    let prediction;
    try {
      prediction = await startVtonPrediction(apiKey, avatarUrl, clothingUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      await supabase
        .from("generation_jobs")
        .update({
          status: "failed",
          error_message: message,
          finished_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      return NextResponse.json(
        { error: `Failed to start generation: ${message}` },
        { status: 502 }
      );
    }

    await supabase
      .from("generation_jobs")
      .update({
        status: "running",
        provider_job_id: prediction.id,
        started_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    return NextResponse.json({ jobId: job.id });
  } catch (err: unknown) {
    console.error("[POST /api/ai/generate]", err);
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}