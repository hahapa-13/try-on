"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type WishlistItem = {
  id: string;
  user_id: string;
  image_url: string;
  type: string | null;
  created_at: string;
};

export default function WishlistPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [urlInput, setUrlInput] = useState("");
  const [typeInput, setTypeInput] = useState("");

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
      .from("wishlist")
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

  async function handleAdd() {
    if (!urlInput.trim()) return;

    setSaving(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("wishlist").insert({
      user_id: user.id,
      image_url: urlInput.trim(),
      type: typeInput || "unknown",
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setUrlInput("");
    setTypeInput("");
    await loadItems();
    setSaving(false);
  }

  async function handleMoveToWardrobe(item: WishlistItem) {
    setMovingId(item.id);
    setError(null);

    const { error: insertError } = await supabase.from("wardrobe").insert({
      user_id: item.user_id,
      image_url: item.image_url,
      title: "Moved from wishlist",
      type: item.type || "unknown",
    });

    if (insertError) {
      setError(insertError.message);
      setMovingId(null);
      return;
    }

    const { error: deleteError } = await supabase.from("wishlist").delete().eq("id", item.id);

    if (deleteError) {
      setError(deleteError.message);
      setMovingId(null);
      return;
    }

    await loadItems();
    setMovingId(null);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);

    const { error } = await supabase.from("wishlist").delete().eq("id", id);

    if (error) setError(error.message);

    await loadItems();
    setDeletingId(null);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Wishlist</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Save ideas for later and move them to wardrobe when you want.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Add wishlist item</h2>

        <input
          type="text"
          placeholder="Image URL"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          className="mb-3 w-full rounded-2xl border border-zinc-300 px-3 py-2 text-sm"
        />

        <input
          type="text"
          placeholder="Type"
          value={typeInput}
          onChange={(e) => setTypeInput(e.target.value)}
          className="mb-3 w-full rounded-2xl border border-zinc-300 px-3 py-2 text-sm"
        />

        <button
          onClick={handleAdd}
          disabled={!urlInput.trim() || saving}
          className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add to wishlist"}
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
          No wishlist items yet.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
            >
              <div className="bg-zinc-50">
                <img
                  src={item.image_url}
                  alt="Wishlist item"
                  className="h-80 w-full object-contain bg-white"
                />
              </div>

              <div className="p-4">
                <h3 className="text-base font-semibold text-zinc-900">Wishlist item</h3>
                <p className="mt-1 text-sm text-zinc-500">{item.type || "No type"}</p>

                <button
                  onClick={() => handleMoveToWardrobe(item)}
                  disabled={movingId === item.id}
                  className="mt-4 w-full rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
                >
                  {movingId === item.id ? "Moving..." : "Move to wardrobe"}
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="mt-3 w-full rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700"
                >
                  {deletingId === item.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}