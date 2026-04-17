"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type WardrobeItem = {
  id: string;
  image_url: string;
  title: string | null;
  type: string | null;
  created_at: string;
};

export default function TryOnPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedClothingUrl, setSelectedClothingUrl] = useState<string | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savingOutfit, setSavingOutfit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
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

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (!profileError && profileData?.avatar_url) {
      setAvatarUrl(profileData.avatar_url);
    } else {
      setAvatarUrl(null);
    }

    const { data: wardrobeData, error: wardrobeError } = await supabase
      .from("wardrobe")
      .select("id, image_url, title, type, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (wardrobeError) {
      setError(wardrobeError.message);
    } else {
      setWardrobeItems(wardrobeData || []);
    }

    const savedClothing = localStorage.getItem("selectedClothing");
    setSelectedClothingUrl(savedClothing || null);

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  useEffect(() => {
    const handleFocus = () => {
      const savedClothing = localStorage.getItem("selectedClothing");
      setSelectedClothingUrl(savedClothing || null);
      loadData();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  useEffect(() => {
    const handleRouteChangeLikeBehavior = () => {
      localStorage.removeItem("selectedClothing");
      setSelectedClothingUrl(null);
    };

    const clearClothingOnLeave = () => {
      handleRouteChangeLikeBehavior();
    };

    window.addEventListener("beforeunload", clearClothingOnLeave);

    return () => {
      window.removeEventListener("beforeunload", clearClothingOnLeave);
    };
  }, []);

  function handleAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);

    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
  }

  async function handleSaveAvatar() {
    if (!avatarFile) return;

    setSavingAvatar(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in.");
      setSavingAvatar(false);
      return;
    }

    const fileExt = avatarFile.name.split(".").pop() || "jpg";
    const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("outfits")
      .upload(filePath, avatarFile, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setSavingAvatar(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("outfits")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    const { error: profileUpsertError } = await supabase.from("profiles").upsert({
      id: user.id,
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    });

    if (profileUpsertError) {
      setError(profileUpsertError.message);
      setSavingAvatar(false);
      return;
    }

    setAvatarUrl(publicUrl);
    setAvatarFile(null);

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    }

    setSavingAvatar(false);
  }

  async function handleRemoveAvatar() {
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in.");
      return;
    }

    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        avatar_url: null,
        updated_at: new Date().toISOString(),
      });

    if (profileUpdateError) {
      setError(profileUpdateError.message);
      return;
    }

    setAvatarUrl(null);
    setAvatarFile(null);

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    }
  }

  async function handleSaveOutfit() {
    if (!avatarUrl || !selectedClothingUrl) {
      setError("Select an avatar and a clothing item first.");
      return;
    }

    setSavingOutfit(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in.");
      setSavingOutfit(false);
      return;
    }

    const generatedPreviewUrl = avatarUrl;

    const { error: insertError } = await supabase.from("outfits").insert({
      user_id: user.id,
      image_url: generatedPreviewUrl,
      title: "Outfit",
    });

    if (insertError) {
      setError(insertError.message);
      setSavingOutfit(false);
      return;
    }

    localStorage.removeItem("selectedClothing");
    setSelectedClothingUrl(null);
    setSavingOutfit(false);

    router.push("/outfits");
  }

  function handleUseWardrobeItem(imageUrl: string) {
    localStorage.setItem("selectedClothing", imageUrl);
    setSelectedClothingUrl(imageUrl);
  }

  const effectiveAvatar = avatarPreview || avatarUrl;

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Try On</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Upload your photo, choose a clothing item, and preview the look before buying.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
              1
            </div>
            <div>
              <h2 className="text-lg font-semibold">Your avatar photo</h2>
              <p className="text-sm text-zinc-500">PNG, JPG or WEBP</p>
            </div>
          </div>

          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleAvatarFileChange}
            className="mb-4 block w-full text-sm"
          />

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSaveAvatar}
              disabled={!avatarFile || savingAvatar}
              className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingAvatar ? "Saving..." : "Save avatar"}
            </button>

            <button
              onClick={handleRemoveAvatar}
              disabled={!avatarUrl && !avatarPreview}
              className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Remove avatar
            </button>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-sm font-medium text-zinc-700">Selected avatar</p>
            <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50">
              {effectiveAvatar ? (
                <img
                  src={effectiveAvatar}
                  alt="Selected avatar"
                  className="h-[520px] w-full object-contain bg-white"
                />
              ) : (
                <div className="flex h-[520px] items-center justify-center text-sm text-zinc-400">
                  No avatar selected
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
              2
            </div>
            <div>
              <h2 className="text-lg font-semibold">Selected clothing item</h2>
              <p className="text-sm text-zinc-500">Choose one item from wardrobe</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50">
            {selectedClothingUrl ? (
              <img
                src={selectedClothingUrl}
                alt="Selected clothing"
                className="h-[520px] w-full object-contain bg-white"
              />
            ) : (
              <div className="flex h-[520px] items-center justify-center text-sm text-zinc-400">
                No clothing item selected
              </div>
            )}
          </div>

          <button
            onClick={handleSaveOutfit}
            disabled={!avatarUrl || !selectedClothingUrl || savingOutfit}
            className="mt-6 rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingOutfit ? "Saving outfit..." : "Save outfit"}
          </button>
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Wardrobe</h2>
          <button
            onClick={() => router.push("/wardrobe")}
            className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700"
          >
            Go to wardrobe
          </button>
        </div>

        {wardrobeItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
            No wardrobe items yet.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {wardrobeItems.map((item) => (
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
                    onClick={() => handleUseWardrobeItem(item.image_url)}
                    className="mt-4 w-full rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
                  >
                    Use in Try-On
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}