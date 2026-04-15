import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type WardrobeItem = {
  id: string;
  user_id: string;
  name: string | null;
  image_url: string;
  storage_path: string;
  source: string;
  created_at: string;
};

export async function saveWardrobeItem(params: {
  userId: string;
  imageUrl: string;
  storagePath: string;
  name?: string | null;
  source?: string;
}) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("wardrobe")
    .insert({
      user_id: params.userId,
      image_url: params.imageUrl,
      storage_path: params.storagePath,
      name: params.name ?? null,
      source: params.source ?? "upload",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as WardrobeItem;
}

export async function getWardrobeItems() {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("wardrobe")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as WardrobeItem[];
}

export async function deleteWardrobeItem(itemId: string, storagePath: string) {
  const supabase = createSupabaseBrowserClient();

  const { error: storageError } = await supabase.storage
    .from("outfits")
    .remove([storagePath]);

  if (storageError) {
    throw storageError;
  }

  const { error: dbError } = await supabase
    .from("wardrobe")
    .delete()
    .eq("id", itemId);

  if (dbError) {
    throw dbError;
  }
}