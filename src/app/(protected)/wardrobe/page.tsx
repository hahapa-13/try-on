"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
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

  const [file, setFile] = useState<File | null>(null);
  const [computerTitle, setComputerTitle] = useState("");
  const [computerType, setComputerType] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [urlTitle, setUrlTitle] = useState("");
  const [urlType, setUrlType] = useState("");

  async function loadItems() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("wardrobe")
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

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
  }

  async function handleAddFromComputer() {
    if (!file) {
      alert("Please choose a file first.");
      return;
    }

    setUploading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("outfits")
      .upload(filePath, file);

    if (uploadError) {
      alert(uploadError.message);
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
      title: computerTitle || "Untitled item",
      type: computerType || null,
    });

    if (insertError) {
      alert(insertError.message);
      setUploading(false);
      return;
    }

    setFile(null);
    setComputerTitle("");
    setComputerType("");
    await loadItems();
    setUploading(false);
  }

  async function handleAddFromUrl() {
    if (!imageUrl.trim()) {
      alert("Please enter an image URL.");
      return;
    }

    setUploading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const { error } = await supabase.from("wardrobe").insert({
      user_id: user.id,
      image_url: imageUrl.trim(),
      title: urlTitle || "Untitled item",
      type: urlType || null,
    });

    if (error) {
      alert(error.message);
      setUploading(false);
      return;
    }

    setImageUrl("");
    setUrlTitle("");
    setUrlType("");
    await loadItems();
    setUploading(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);

    const { error } = await supabase.from("wardrobe").delete().eq("id", id);

    if (error) {
      alert(error.message);
      setDeletingId(null);
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
    setDeletingId(null);
  }

  function handleUseInTryOn(item: WardrobeItem) {
    localStorage.setItem("selectedClothing", JSON.stringify(item));
    router.push("/try-on");
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-3xl font-semibold text-zinc-900">Wardrobe</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Save clothing items and reuse them in try-on.
      </p>

      <section className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-900">Add item</h2>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 p-4">
            <p className="mb-3 text-sm font-medium text-zinc-700">From computer</p>

            <div className="space-y-3">
              <input type="file" onChange={handleFileChange} className="block w-full text-sm" />

              <input
                type="text"
                placeholder="Title"
                value={computerTitle}
                onChange={(e) => setComputerTitle(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
              />

              <input
                type="text"
                placeholder="Type"
                value={computerType}
                onChange={(e) => setComputerType(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
              />

              <button
                onClick={handleAddFromComputer}
                disabled={uploading}
                className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60"
              >
                {uploading ? "Adding..." : "Add item"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 p-4">
            <p className="mb-3 text-sm font-medium text-zinc-700">From URL</p>

            <div className="space-y-3">
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
                value={urlTitle}
                onChange={(e) => setUrlTitle(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
              />

              <input
                type="text"
                placeholder="Type"
                value={urlType}
                onChange={(e) => setUrlType(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
              />

              <button
                onClick={handleAddFromUrl}
                disabled={uploading}
                className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60"
              >
                {uploading ? "Adding..." : "Add item"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        {loading ? (
          <p className="text-sm text-zinc-500">Loading wardrobe...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-zinc-500">No items yet.</p>
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
                    alt={item.title ?? "Wardrobe item"}
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
                  onClick={() => handleUseInTryOn(item)}
                  className="mt-4 w-full rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
                >
                  Use in Try-On
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