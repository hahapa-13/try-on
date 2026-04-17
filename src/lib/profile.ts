import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type ProfileRow = {
  id: string;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export async function getMyProfile(userId: string): Promise<ProfileRow | null> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data as ProfileRow | null;
}

export async function ensureMyProfile(user: {
  id: string;
  email?: string | null;
}): Promise<ProfileRow> {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
    },
    {
      onConflict: "id",
    }
  );

  if (error) throw new Error(error.message);

  const profile = await getMyProfile(user.id);

  if (!profile) {
    throw new Error("Failed to load profile after upsert.");
  }

  return profile;
}

export async function updateMyAvatar(
  userId: string,
  avatarUrl: string | null
): Promise<ProfileRow> {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      avatar_url: avatarUrl,
    },
    { onConflict: "id" }
  );

  if (error) throw new Error(error.message);

  const profile = await getMyProfile(userId);

  if (!profile) {
    throw new Error("Failed to load profile after avatar update.");
  }

  return profile;
}