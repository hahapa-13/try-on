import { createSupabaseServerClient } from "@/lib/supabase/server";

const BUCKET = "outfits";
const RESULTS_FOLDER = "ai-results";

/**
 * storagePath convention used throughout this project:
 *   - always relative to the bucket root
 *   - never includes the bucket name as a prefix
 *   - example: "ai-results/user-id/1713000000000.jpg"
 *
 * publicUrl convention:
 *   - full HTTPS URL
 *   - example: "https://xxx.supabase.co/storage/v1/object/public/outfits/ai-results/..."
 */

export async function downloadAndStoreResult(
  replicateResultUrl: string,
  userId: string
): Promise<string> {
  const fetchRes = await fetch(replicateResultUrl, { cache: "no-store" });
  if (!fetchRes.ok) {
    throw new Error(
      `Failed to download AI result (HTTP ${fetchRes.status}).`
    );
  }

  const arrayBuffer = await fetchRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType =
    fetchRes.headers.get("content-type") ?? "image/jpeg";
  const ext =
    contentType.split("/")[1]?.split(";")[0]?.trim() ?? "jpg";

  // storagePath: bucket-relative, no bucket prefix
  const storagePath = `${RESULTS_FOLDER}/${userId}/${Date.now()}.${ext}`;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: false });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  return storagePath;
}

/**
 * Converts a bucket-relative storagePath into a full public URL.
 *
 * Input:  "ai-results/abc/1713000000000.jpg"
 * Output: "https://xxx.supabase.co/storage/v1/object/public/outfits/ai-results/abc/1713000000000.jpg"
 */
export function storagePathToPublicUrl(storagePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.");
  const cleanPath = storagePath.replace(/^\/+/, "");
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${cleanPath}`;
}

/**
 * Returns true when the given URL points to the outfits bucket
 * in this Supabase project.
 */
export function isOwnSupabaseUrl(url: string): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return false;
  try {
    const parsed = new URL(url);
    const base = new URL(supabaseUrl);
    return (
      parsed.hostname === base.hostname &&
      parsed.pathname.startsWith(
        `/storage/v1/object/public/${BUCKET}/`
      )
    );
  } catch {
    return false;
  }
}

/**
 * Extracts the bucket-relative storagePath from a full public URL.
 *
 * Input:  "https://xxx.supabase.co/storage/v1/object/public/outfits/ai-results/foo.jpg"
 * Output: "ai-results/foo.jpg"
 */
export function extractStoragePath(publicUrl: string): string {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) {
    throw new Error(
      `URL does not point to the "${BUCKET}" bucket: ${publicUrl}`
    );
  }
  return publicUrl.slice(idx + marker.length);
}