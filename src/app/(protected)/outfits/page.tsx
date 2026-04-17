/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { updateMyAvatar } from "@/lib/profile";

type OutfitItem = {
  id: string;
  user_id: string;
  image_url: string;
  title: string | null;
  created_at: string;
};

export default function OutfitsPage() {
  const { user, loading } = useUser();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [items, setItems] = useState<OutfitItem[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingAvatarId, setSavingAvatarId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      loadItems();
    }

    if (!loading && !user) {
      setPageLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  async function loadItems() {
    try {
      setPageLoading(true);
      setError(null);

      if (!user) return;

      const { data, error } = await supabase
        .from("outfits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
        return;
      }

      setItems((data ?? []) as OutfitItem[]);
    } catch (err: any) {
      setError(err.message || "Failed to load outfits.");
    } finally {
      setPageLoading(false);
    }
  }

  function getStoragePath(imageUrl: string): string | null {
    const marker = "/object/public/outfits/";
    const idx = imageUrl.indexOf(marker);
    if (idx === -1) return null;
    return imageUrl.slice(idx + marker.length);
  }

  async function handleDelete(id: string, imageUrl: string) {
    try {
      setError(null);
      setDeletingId(id);

      const { error } = await supabase.from("outfits").delete().eq("id", id);

      if (error) {
        setError(error.message);
        return;
      }

      const path = getStoragePath(imageUrl);
      if (path) {
        await supabase.storage.from("outfits").remove([path]);
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete outfit.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleUseAsAvatar(imageUrl: string, itemId: string) {
    try {
      setError(null);
      setSavingAvatarId(itemId);

      await updateMyAvatar(user!.id, imageUrl);

      localStorage.setItem("selectedAvatar", imageUrl);
      window.location.href = "/try-on";
    } catch (err: any) {
      setError(err.message || "Failed to set avatar.");
      setSavingAvatarId(null);
    }
  }

  if (loading || pageLoading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-8">
        <p className="text-sm text-zinc-500">Loading outfits...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            My Outfits
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            You need to log in to see your outfits.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-3xl font-semibold text-zinc-900">My Outfits</h1>
      <p className="mt-2 text-sm text-zinc-600">
        View saved try-on results and reuse them as avatar.
      </p>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      <section className="mt-8">
        {items.length === 0 ? (
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
                  onClick={() => handleUseAsAvatar(item.image_url, item.id)}
                  disabled={savingAvatarId === item.id}
                  className="mt-4 w-full rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60"
                >
                  {savingAvatarId === item.id ? "Saving..." : "Use as avatar"}
                </button>

                <button
                  onClick={() => handleDelete(item.id, item.image_url)}
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