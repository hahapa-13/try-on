"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type WishlistItem = {
  id: string;
  user_id: string;
  image_url: string;
  title: string | null;
  type: string | null;
  created_at: string;
};

export default function WishlistPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");

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
      .from("wishlist")
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

  async function handleAdd() {
    if (!imageUrl.trim()) {
      alert("Please enter an image URL.");
      return;
    }

    setAdding(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAdding(false);
      return;
    }

    const { error } = await supabase.from("wishlist").insert({
      user_id: user.id,
      image_url: imageUrl.trim(),
      title: title || "Untitled item",
      type: type || null,
    });

    if (error) {
      alert(error.message);
      setAdding(false);
      return;
    }

    setImageUrl("");
    setTitle("");
    setType("");
    await loadItems();
    setAdding(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);

    const { error } = await supabase.from("wishlist").delete().eq("id", id);

    if (error) {
      alert(error.message);
      setDeletingId(null);
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
    setDeletingId(null);
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-3xl font-semibold text-zinc-900">Wishlist</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Save ideas for later and move them to wardrobe when you want.
      </p>

      <section className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-900">Add wishlist item</h2>

        <div className="mt-6 max-w-3xl space-y-3">
          <input
            type="text"
            placeholder="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
          />

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
          />

          <input
            type="text"
            placeholder="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
          />

          <button
            onClick={handleAdd}
            disabled={adding}
            className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60"
          >
            {adding ? "Adding..." : "Add item"}
          </button>
        </div>
      </section>

      <section className="mt-8">
        {loading ? (
          <p className="text-sm text-zinc-500">Loading wishlist...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-zinc-500">No wishlist items yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="flex h-72 items-center justify-center overflow-hidden rounded-2xl bg-zinc-50">
                  <img
                    src={item.image_url}
                    alt={item.title ?? "Wishlist item"}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-semibold text-zinc-900">
                    {item.title || "Untitled item"}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">{item.type || "No type"}</p>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="mt-4 w-full rounded-full border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-60"
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