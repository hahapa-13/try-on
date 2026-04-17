import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type ProfileRow = {
  id: string;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export async function getMyProfile(userId: string) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as ProfileRow | null;
}

export async function ensureMyProfile(user: { id: string; email?: string | null }) {
  const supabase = createSupabaseBrowserClient();

  const existing = await getMyProfile(user.id);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ProfileRow;
}

export async function updateMyAvatar(userId: string, avatarUrl: string | null) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        avatar_url: avatarUrl,
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ProfileRow;
}