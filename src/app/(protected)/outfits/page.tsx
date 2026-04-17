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

  async function loadItems() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("outfits")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setItems(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);

    const { error } = await supabase.from("outfits").delete().eq("id", id);

    if (error) {
      alert(error.message);
      setDeletingId(null);
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
    setDeletingId(null);
  }

  async function handleUseAsAvatar(imageUrl: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          avatar_url: imageUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) {
      alert(error.message);
      return;
    }

    alert("Avatar saved.");
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-3xl font-semibold text-zinc-900">My Outfits</h1>
      <p className="mt-2 text-sm text-zinc-600">
        View saved try-on results and reuse them as avatar.
      </p>

      <section className="mt-8">
        {loading ? (
          <p className="text-sm text-zinc-500">Loading outfits...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-zinc-500">No outfits saved yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="flex h-[420px] items-center justify-center overflow-hidden rounded-2xl bg-zinc-50">
                  <img
                    src={item.image_url}
                    alt={item.title ?? "Outfit"}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-semibold text-zinc-900">
                    {item.title || "Outfit"}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => handleUseAsAvatar(item.image_url)}
                  className="mt-4 w-full rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
                >
                  Use as avatar
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="mt-3 w-full rounded-full border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-60"
                >
                  {deletingId === item.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}