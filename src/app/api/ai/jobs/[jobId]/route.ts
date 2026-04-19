import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { decryptApiKey } from "@/lib/ai/crypto";
import { getPrediction } from "@/lib/ai/replicate";
import {
  downloadAndStoreResult,
  storagePathToPublicUrl,
} from "@/lib/ai/storage";

type JobResponse = {
  jobId: string;
  status: "pending" | "running" | "succeeded" | "failed" | "cancelled";
  resultUrl: string | null;
  errorMessage: string | null;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
): Promise<NextResponse> {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: job, error: jobError } = await supabase
      .from("generation_jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    // Terminal states: return immediately without calling Replicate
    if (
      job.status === "succeeded" ||
      job.status === "failed" ||
      job.status === "cancelled"
    ) {
      const resultUrl = job.result_storage_path
        ? storagePathToPublicUrl(job.result_storage_path)
        : null;

      const response: JobResponse = {
        jobId: job.id,
        status: job.status,
        resultUrl,
        errorMessage: job.error_message ?? null,
      };
      return NextResponse.json(response);
    }

    // Job is still in progress — poll Replicate
    if (!job.provider_job_id) {
      const response: JobResponse = {
        jobId: job.id,
        status: job.status,
        resultUrl: null,
        errorMessage: null,
      };
      return NextResponse.json(response);
    }

    const { data: connection } = await supabase
      .from("ai_connections")
      .select("encrypted_key")
      .eq("user_id", user.id)
      .eq("provider", "replicate")
      .maybeSingle();

    if (!connection) {
      return NextResponse.json(
        { error: "AI connection not found." },
        { status: 422 }
      );
    }

    let apiKey: string;
    try {
      apiKey = decryptApiKey(connection.encrypted_key);
    } catch {
      return NextResponse.json(
        { error: "Failed to decrypt API key." },
        { status: 500 }
      );
    }

    let prediction;
    try {
      prediction = await getPrediction(apiKey, job.provider_job_id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json(
        { error: `Failed to poll Replicate: ${message}` },
        { status: 502 }
      );
    }

    if (prediction.status === "succeeded") {
      const outputUrl =
        Array.isArray(prediction.output) && prediction.output.length > 0
          ? prediction.output[0]
          : null;

      if (!outputUrl) {
        await supabase
          .from("generation_jobs")
          .update({
            status: "failed",
            error_message: "Replicate returned no output.",
            provider_response: prediction as object,
            finished_at: new Date().toISOString(),
          })
          .eq("id", job.id);

        const response: JobResponse = {
          jobId: job.id,
          status: "failed",
          resultUrl: null,
          errorMessage: "Replicate returned no output.",
        };
        return NextResponse.json(response);
      }

      let storagePath: string;
      try {
        storagePath = await downloadAndStoreResult(outputUrl, user.id);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        await supabase
          .from("generation_jobs")
          .update({
            status: "failed",
            error_message: `Failed to store result: ${message}`,
            provider_response: prediction as object,
            finished_at: new Date().toISOString(),
          })
          .eq("id", job.id);

        const response: JobResponse = {
          jobId: job.id,
          status: "failed",
          resultUrl: null,
          errorMessage: `Failed to store result: ${message}`,
        };
        return NextResponse.json(response);
      }

      await supabase
        .from("generation_jobs")
        .update({
          status: "succeeded",
          result_storage_path: storagePath,
          provider_response: prediction as object,
          finished_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      const response: JobResponse = {
        jobId: job.id,
        status: "succeeded",
        resultUrl: storagePathToPublicUrl(storagePath),
        errorMessage: null,
      };
      return NextResponse.json(response);
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      const normalizedStatus =
        prediction.status === "canceled" ? "cancelled" : "failed";
      const errorMessage =
        prediction.error ?? `Replicate prediction ${prediction.status}.`;

      await supabase
        .from("generation_jobs")
        .update({
          status: normalizedStatus,
          error_message: errorMessage,
          provider_response: prediction as object,
          finished_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      const response: JobResponse = {
        jobId: job.id,
        status: normalizedStatus,
        resultUrl: null,
        errorMessage,
      };
      return NextResponse.json(response);
    }

    // Still starting or processing
    const response: JobResponse = {
      jobId: job.id,
      status: "running",
      resultUrl: null,
      errorMessage: null,
    };
    return NextResponse.json(response);
  } catch (err: unknown) {
    console.error("[GET /api/ai/jobs/[jobId]]", err);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}