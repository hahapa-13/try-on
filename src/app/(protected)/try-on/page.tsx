"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type WardrobeItem = {
  id: string;
  image_url: string;
  title: string | null;
  type: string | null;
  created_at: string;
};

export default function TryOnPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedClothingUrl, setSelectedClothingUrl] = useState<string | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [loadingWardrobe, setLoadingWardrobe] = useState(true);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savingOutfit, setSavingOutfit] = useState(false);

  async function loadProfileAvatar() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (data?.avatar_url) {
      setAvatarUrl(data.avatar_url);
    }
  }

  async function loadWardrobeItems() {
    setLoadingWardrobe(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("wardrobe")
      .select("id, image_url, title, type, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setWardrobeItems(data);
    }

    setLoadingWardrobe(false);
  }

  useEffect(() => {
    loadProfileAvatar();
    loadWardrobeItems();

    const stored = localStorage.getItem("selectedClothing");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.image_url) {
          setSelectedClothingUrl(parsed.image_url);
        }
      } catch {}
    }
  }, []);

  function handleAvatarFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setAvatarFile(file);

    if (file) {
      const preview = URL.createObjectURL(file);
      setAvatarPreview(preview);
    } else {
      setAvatarPreview(null);
    }
  }

  async function handleSaveAvatar() {
    if (!avatarFile) {
      alert("Please choose an avatar image first.");
      return;
    }

    setSavingAvatar(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const fileExt = avatarFile.name.split(".").pop() || "jpg";
    const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("outfits")
      .upload(filePath, avatarFile);

    if (uploadError) {
      alert(uploadError.message);
      setSavingAvatar(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("outfits")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (profileError) {
      alert(profileError.message);
      setSavingAvatar(false);
      return;
    }

    setAvatarUrl(publicUrl);
    setAvatarFile(null);
    setAvatarPreview(null);
    setSavingAvatar(false);
  }

  async function handleRemoveAvatar() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          avatar_url: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) {
      alert(error.message);
      return;
    }

    setAvatarUrl(null);
    setAvatarFile(null);
    setAvatarPreview(null);
  }

  function handleUseItem(item: WardrobeItem) {
    setSelectedClothingUrl(item.image_url);
    localStorage.setItem("selectedClothing", JSON.stringify(item));
  }

  function handleRemoveClothing() {
    setSelectedClothingUrl(null);
    localStorage.removeItem("selectedClothing");
  }

  async function handleSaveOutfit() {
    const currentAvatar = avatarPreview || avatarUrl;

    if (!currentAvatar || !selectedClothingUrl) {
      alert("Please select both an avatar and a clothing item.");
      return;
    }

    setSavingOutfit(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const { error } = await supabase.from("outfits").insert({
      user_id: user.id,
      image_url: currentAvatar,
      title: "Outfit",
    });

    if (error) {
      alert(error.message);
      setSavingOutfit(false);
      return;
    }

    alert("Outfit saved.");
    setSavingOutfit(false);
  }

  const displayedAvatar = avatarPreview || avatarUrl;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSaveAvatar}
              disabled={savingAvatar}
              className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60"
            >
              {savingAvatar ? "Saving..." : "Save avatar"}
            </button>

            <button
              onClick={handleRemoveAvatar}
              className="rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Remove avatar
            </button>
          </div>

          <p className="mt-6 text-sm font-medium text-zinc-700">Selected avatar</p>

          <div className="mt-3 flex h-[500px] items-center justify-center overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50">
            {displayedAvatar ? (
              <img
                src={displayedAvatar}
                alt="Selected avatar"
                className="h-full w-full object-contain"
              />
            ) : (
              <p className="text-sm text-zinc-400">No avatar selected</p>
            )}
          </div>

          <div className="mt-4">
            <input type="file" accept="image/*" onChange={handleAvatarFileChange} />
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex h-[500px] items-center justify-center overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50">
            {selectedClothingUrl ? (
              <img
                src={selectedClothingUrl}
                alt="Selected clothing"
                className="h-full w-full object-contain"
              />
            ) : (
              <p className="text-sm text-zinc-400">No clothing item selected</p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleSaveOutfit}
              disabled={savingOutfit}
              className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60"
            >
              {savingOutfit ? "Saving..." : "Save outfit"}
            </button>

            <button
              onClick={handleRemoveClothing}
              className="rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Remove clothing
            </button>
          </div>
        </section>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-zinc-900">Wardrobe</h2>
          <button
            onClick={() => router.push("/wardrobe")}
            className="rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Go to wardrobe
          </button>
        </div>

        {loadingWardrobe ? (
          <p className="text-sm text-zinc-500">Loading wardrobe...</p>
        ) : wardrobeItems.length === 0 ? (
          <p className="text-sm text-zinc-500">No wardrobe items yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {wardrobeItems.map((item) => (
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
                  onClick={() => handleUseItem(item)}
                  className="mt-4 w-full rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
                >
                  Use in Try-On
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}