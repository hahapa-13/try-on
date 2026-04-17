"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type OutfitItem = {
  id: string;
  user_id: string;
  image_url: string;
  title: string | null;
  created_at: string;
};

export default function OutfitsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [items, setItems] = useState<OutfitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingAvatarId, setSettingAvatarId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadItems() {
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("outfits")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    else setItems(data || []);

    setLoading(false);
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleUseAsAvatar(item: OutfitItem) {
    setSettingAvatarId(item.id);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in.");
      setSettingAvatarId(null);
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      avatar_url: item.image_url,
      updated_at: new Date().toISOString(),
    });

    if (error) setError(error.message);

    setSettingAvatarId(null);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);

    const { error } = await supabase.from("outfits").delete().eq("id", id);

    if (error) setError(error.message);

    await loadItems();
    setDeletingId(null);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">My Outfits</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Saved try-on results from your account.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
          No outfits yet.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
            >
              <div className="bg-zinc-50">
                <img
                  src={item.image_url}
                  alt={item.title || "Outfit"}
                  className="h-[520px] w-full object-contain bg-white"
                />
              </div>

              <div className="p-4">
                <h3 className="line-clamp-1 text-base font-semibold text-zinc-900">
                  {item.title || "Outfit"}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleUseAsAvatar(item)}
                    disabled={settingAvatarId === item.id}
                    className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
                  >
                    {settingAvatarId === item.id ? "Saving..." : "Use as avatar"}
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="rounded-2xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700"
                  >
                    {deletingId === item.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}