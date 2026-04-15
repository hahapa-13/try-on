/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { ImageUpload } from "@/components/ImageUpload";

type WishlistItem = {
  id: string;
  image_url: string;
  created_at: string;
  title?: string | null;
  type?: string | null;
};

export default function WishlistPage() {
  const { user, loading } = useUser();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

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
        .from("wishlist")
        .select("id, image_url, created_at, title, type")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
        return;
      }

      setItems((data ?? []) as WishlistItem[]);
    } catch (err: any) {
      setError(err.message || "Failed to load wishlist.");
    } finally {
      setPageLoading(false);
    }
  }

  async function uploadFileToSupabase(file: File) {
    const filePath = `wishlist-items/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    const { data, error } = await supabase.storage
      .from("outfits")
      .upload(filePath, file);

    if (error) {
      throw new Error(error.message);
    }

    const { data: publicUrlData } = supabase.storage
      .from("outfits")
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  }

  async function handleAddItem() {
    try {
      setError(null);

      if (!user) {
        setError("You must be logged in.");
        return;
      }

      if (!newFile && !newUrl.trim()) {
        setError("Please upload an image or paste an image URL.");
        return;
      }

      setSaving(true);

      let imageUrl = newUrl.trim();

      if (newFile) {
        imageUrl = await uploadFileToSupabase(newFile);
      }

      const { error } = await supabase.from("wishlist").insert({
        user_id: user.id,
        image_url: imageUrl,
        title: title.trim() || null,
        type: type.trim() || null,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setNewFile(null);
      setNewUrl("");
      setTitle("");
      setType("");
      setShowAddForm(false);

      await loadItems();
    } catch (err: any) {
      setError(err.message || "Failed to add item.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      setError(null);
      setDeletingId(id);

      const { error } = await supabase.from("wishlist").delete().eq("id", id);

      if (error) {
        setError(error.message);
        return;
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete item.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleMoveToWardrobe(item: WishlistItem) {
    try {
      if (!user) {
        setError("You must be logged in.");
        return;
      }

      setError(null);
      setMovingId(item.id);

      const { error: insertError } = await supabase.from("wardrobe").insert({
        user_id: user.id,
        image_url: item.image_url,
        title: item.title ?? null,
        type: item.type ?? null,
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      const { error: deleteError } = await supabase
        .from("wishlist")
        .delete()
        .eq("id", item.id);

      if (deleteError) {
        setError(deleteError.message);
        return;
      }

      setItems((prev) => prev.filter((wishlistItem) => wishlistItem.id !== item.id));
    } catch (err: any) {
      setError(err.message || "Failed to move item to wardrobe.");
    } finally {
      setMovingId(null);
    }
  }

  function handleUseInTryOn(imageUrl: string) {
    localStorage.setItem("selectedClothing", imageUrl);
    window.location.href = "/try-on";
  }

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="mx-auto w-full max-w-6xl px-4 py-6">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Loading wishlist...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="mx-auto w-full max-w-6xl px-4 py-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Wishlist
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              You need to log in to see your wishlist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Wishlist
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Save items you want to try later.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
          >
            {showAddForm ? "Close" : "Add item"}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        {showAddForm && (
          <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="grid gap-4">
              <ImageUpload
                label="Upload wishlist item"
                helpText="PNG, JPG, or WEBP (max 10MB)"
                value={newFile}
                onChange={setNewFile}
              />

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Or add by image URL
                </label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com/item.jpg"
                  className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brown jacket"
                  className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Type (optional)
                </label>
                <input
                  type="text"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="Jacket / Hoodie / Dress"
                  className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                />
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                disabled={saving}
                className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
              >
                {saving ? "Saving..." : "Save item"}
              </button>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No wishlist items yet. Add your first item.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="aspect-[4/5] w-full bg-zinc-100 dark:bg-zinc-900">
                  <img
                    src={item.image_url}
                    alt={item.title || "Wishlist item"}
                    className="block h-full w-full object-contain"
                  />
                </div>

                <div className="space-y-3 p-4">
                  <div className="min-h-[52px]">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {item.title || "Untitled item"}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {item.type || "No type"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => handleUseInTryOn(item.image_url)}
                      className="rounded-xl bg-black px-3 py-2.5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
                    >
                      Use in Try-On
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoveToWardrobe(item)}
                      disabled={movingId === item.id}
                      className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm font-medium text-zinc-900 dark:border-zinc-700 dark:text-zinc-50"
                    >
                      {movingId === item.id ? "Moving..." : "Move to wardrobe"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm font-medium text-zinc-900 dark:border-zinc-700 dark:text-zinc-50"
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
    </div>
  );
}