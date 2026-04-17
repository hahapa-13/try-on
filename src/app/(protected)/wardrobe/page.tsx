"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type WardrobeItem = {
  id: string;
  user_id: string;
  image_url: string;
  title: string | null;
  type: string | null;
  created_at: string;
};

export default function WardrobePage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
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
      .from("wardrobe")
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

  async function handleAddFromFile() {
    if (!file) return;

    setUploading(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in.");
      setUploading(false);
      return;
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const filePath = `${user.id}/wardrobe-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("outfits")
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("outfits")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    const { error: insertError } = await supabase.from("wardrobe").insert({
      user_id: user.id,
      image_url: publicUrl,
      title: titleInput || "My item",
      type: typeInput || "unknown",
    });

    if (insertError) {
      setError(insertError.message);
      setUploading(false);
      return;
    }

    setFile(null);
    setTitleInput("");
    setTypeInput("");
    await loadItems();
    setUploading(false);
  }

  async function handleAddFromUrl() {
    if (!urlInput.trim()) return;

    setUploading(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in.");
      setUploading(false);
      return;
    }

    const { error: insertError } = await supabase.from("wardrobe").insert({
      user_id: user.id,
      image_url: urlInput.trim(),
      title: titleInput || "My item",
      type: typeInput || "unknown",
    });

    if (insertError) {
      setError(insertError.message);
      setUploading(false);
      return;
    }

    setUrlInput("");
    setTitleInput("");
    setTypeInput("");
    await loadItems();
    setUploading(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);

    const { error } = await supabase.from("wardrobe").delete().eq("id", id);

    if (error) setError(error.message);

    await loadItems();
    setDeletingId(null);
  }

  function handleUseInTryOn(imageUrl: string) {
    localStorage.setItem("selectedClothing", imageUrl);
    router.push("/try-on");
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Wardrobe</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Save clothing items and reuse them in try-on.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Add item</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 p-4">
            <p className="mb-3 text-sm font-medium text-zinc-700">From computer</p>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mb-3 block w-full text-sm"
            />

            <input
              type="text"
              placeholder="Title"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
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
              onClick={handleAddFromFile}
              disabled={!file || uploading}
              className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Add from computer"}
            </button>
          </div>

          <div className="rounded-2xl border border-zinc-200 p-4">
            <p className="mb-3 text-sm font-medium text-zinc-700">From URL</p>

            <input
              type="text"
              placeholder="Image URL"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="mb-3 w-full rounded-2xl border border-zinc-300 px-3 py-2 text-sm"
            />

            <input
              type="text"
              placeholder="Title"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
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
              onClick={handleAddFromUrl}
              disabled={!urlInput.trim() || uploading}
              className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {uploading ? "Saving..." : "Add from URL"}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
          No wardrobe items yet.
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
                  alt={item.title || "Wardrobe item"}
                  className="h-80 w-full object-contain bg-white"
                />
              </div>

              <div className="p-4">
                <h3 className="line-clamp-1 text-base font-semibold text-zinc-900">
                  {item.title || "Untitled item"}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">{item.type || "No type"}</p>

                <button
                  onClick={() => handleUseInTryOn(item.image_url)}
                  className="mt-4 w-full rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
                >
                  Use in Try-On
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