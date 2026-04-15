/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { ImageUpload } from "@/components/ImageUpload";
import { ButtonLink } from "@/components/ui/Button";
import { compressImage } from "@/lib/image";

type TryOnStorage = {
  avatarUrl: string | null;
};

const TRY_ON_STORAGE_KEY = "tryOnData";

function readTryOnStorage(): TryOnStorage {
  if (typeof window === "undefined") {
    return { avatarUrl: null };
  }

  try {
    const raw = sessionStorage.getItem(TRY_ON_STORAGE_KEY);
    if (!raw) {
      return { avatarUrl: null };
    }

    const parsed = JSON.parse(raw) as Partial<TryOnStorage>;

    return {
      avatarUrl: parsed.avatarUrl ?? null,
    };
  } catch {
    return { avatarUrl: null };
  }
}

function writeTryOnStorage(data: TryOnStorage) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TRY_ON_STORAGE_KEY, JSON.stringify(data));
}

function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:120ms]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:240ms]" />
    </span>
  );
}

function SectionBadge({ value }: { value: string }) {
  return (
    <div className="grid h-8 w-8 place-items-center rounded-full bg-black text-xs font-semibold text-white dark:bg-zinc-50 dark:text-zinc-900">
      {value}
    </div>
  );
}

function PreviewSkeleton() {
  return (
    <div className="space-y-3">
      <div className="aspect-[4/5] w-full animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="h-11 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
        <div className="h-11 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
      </div>
    </div>
  );
}

export default function TryOnPage() {
  const { user, loading } = useUser();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [mounted, setMounted] = useState(false);

  const [avatar, setAvatar] = useState<File | null>(null);
  const [clothing, setClothing] = useState<File | null>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [clothingUrl, setClothingUrl] = useState<string | null>(null);
  const [clothingInputUrl, setClothingInputUrl] = useState("");

  const [isPreparingAvatar, setIsPreparingAvatar] = useState(false);
  const [isPreparingClothing, setIsPreparingClothing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingWishlist, setIsSavingWishlist] = useState(false);
  const [isSavingWardrobe, setIsSavingWardrobe] = useState(false);
  const [isSavingResult, setIsSavingResult] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [pendingResultBlob, setPendingResultBlob] = useState<Blob | null>(null);
  const [lastKey, setLastKey] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const stored = readTryOnStorage();

    const selectedAvatar = localStorage.getItem("selectedAvatar");
    const selectedClothing = localStorage.getItem("selectedClothing");

    const nextAvatarUrl = selectedAvatar ?? stored.avatarUrl ?? null;
    const nextClothingUrl = selectedClothing ?? null;

    setAvatarUrl(nextAvatarUrl);
    setClothingUrl(nextClothingUrl);
    setClothingInputUrl(nextClothingUrl ?? "");

    setClothing(null);
    setResultUrl(null);
    setPendingResultBlob(null);
    setLastKey(null);
    setError(null);

    writeTryOnStorage({
      avatarUrl: nextAvatarUrl,
    });

    if (selectedAvatar) localStorage.removeItem("selectedAvatar");
    if (selectedClothing) localStorage.removeItem("selectedClothing");
  }, [mounted]);

  useEffect(() => {
    return () => {
      if (resultUrl && resultUrl.startsWith("blob:")) {
        URL.revokeObjectURL(resultUrl);
      }
    };
  }, [resultUrl]);

  const canGenerate = Boolean(avatarUrl && clothingUrl);

  async function uploadFileToSupabase(file: File, folder: string) {
    const filePath = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

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

  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }

  async function createCompositePreview() {
    if (!avatarUrl || !clothingUrl) {
      throw new Error("Missing avatar or clothing image.");
    }

    const avatarImg = await loadImage(avatarUrl);
    const clothingImg = await loadImage(clothingUrl);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not create canvas context.");
    }

    const MAX_WIDTH = 900;
    const originalWidth = avatarImg.naturalWidth || avatarImg.width;
    const originalHeight = avatarImg.naturalHeight || avatarImg.height;
    const scale = Math.min(1, MAX_WIDTH / originalWidth);

    const width = Math.round(originalWidth * scale);
    const height = Math.round(originalHeight * scale);

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(avatarImg, 0, 0, width, height);

    const overlayWidth = width * 0.7;
    const overlayHeight = overlayWidth;
    const overlayX = width / 2 - overlayWidth / 2;
    const overlayY = height * 0.44 - overlayHeight / 2;

    ctx.globalAlpha = 0.72;
    ctx.drawImage(clothingImg, overlayX, overlayY, overlayWidth, overlayHeight);
    ctx.globalAlpha = 1;

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to export preview image."));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        0.9
      );
    });
  }

  async function handleAvatarChange(file: File | null) {
    setError(null);

    if (!file) {
      clearAvatar();
      return;
    }

    try {
      setIsPreparingAvatar(true);

      const compressed = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1600,
        quality: 0.84,
        mimeType: "image/jpeg",
      });

      const objectUrl = URL.createObjectURL(compressed);

      setAvatar(compressed);
      setAvatarUrl(objectUrl);

      writeTryOnStorage({
        avatarUrl: objectUrl,
      });
    } catch (err: any) {
      setError(err.message || "Failed to prepare avatar image.");
    } finally {
      setIsPreparingAvatar(false);
    }
  }

  async function handleClothingChange(file: File | null) {
    setError(null);

    if (!file) {
      clearClothing();
      return;
    }

    try {
      setIsPreparingClothing(true);

      const compressed = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1600,
        quality: 0.84,
        mimeType: "image/jpeg",
      });

      const objectUrl = URL.createObjectURL(compressed);

      setClothing(compressed);
      setClothingUrl(objectUrl);
      setClothingInputUrl("");
      setResultUrl(null);
      setPendingResultBlob(null);
      setLastKey(null);
    } catch (err: any) {
      setError(err.message || "Failed to prepare clothing image.");
    } finally {
      setIsPreparingClothing(false);
    }
  }

  function applyClothingUrl() {
    const trimmed = clothingInputUrl.trim();

    if (!trimmed) {
      setError("Please enter an image URL.");
      return;
    }

    setError(null);
    setClothing(null);
    setClothingUrl(trimmed);
    setResultUrl(null);
    setPendingResultBlob(null);
    setLastKey(null);
  }

  async function saveItemToWishlist() {
    try {
      setError(null);
      setIsSavingWishlist(true);

      if (!user) {
        setError("You must be logged in to save to wishlist.");
        return;
      }

      let finalClothingUrl = clothingUrl;

      if (clothing && (!finalClothingUrl || finalClothingUrl.startsWith("blob:"))) {
        finalClothingUrl = await uploadFileToSupabase(clothing, "wishlist-items");
        setClothingUrl(finalClothingUrl);
      }

      if (!finalClothingUrl) {
        setError("Please select a clothing item first.");
        return;
      }

      const { error } = await supabase.from("wishlist").insert({
        user_id: user.id,
        image_url: finalClothingUrl,
      });

      if (error) {
        setError(error.message);
        return;
      }

      alert("Saved to wishlist!");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSavingWishlist(false);
    }
  }

  async function saveItemToWardrobe() {
    try {
      setError(null);
      setIsSavingWardrobe(true);

      if (!user) {
        setError("You must be logged in to save to wardrobe.");
        return;
      }

      let finalClothingUrl = clothingUrl;

      if (clothing && (!finalClothingUrl || finalClothingUrl.startsWith("blob:"))) {
        finalClothingUrl = await uploadFileToSupabase(clothing, "wardrobe-items");
        setClothingUrl(finalClothingUrl);
      }

      if (!finalClothingUrl) {
        setError("Please select a clothing item first.");
        return;
      }

      const { error } = await supabase.from("wardrobe").insert({
        user_id: user.id,
        image_url: finalClothingUrl,
      });

      if (error) {
        setError(error.message);
        return;
      }

      alert("Saved to wardrobe!");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSavingWardrobe(false);
    }
  }

  async function onGenerate() {
    if (isGenerating) return;

    try {
      setError(null);

      if (!avatarUrl) {
        setError("Please upload your photo or select an avatar from outfits.");
        return;
      }

      if (!clothingUrl) {
        setError("Please select a clothing item.");
        return;
      }

      const currentKey = `${avatarUrl}-${clothingUrl}`;
      if (currentKey === lastKey && resultUrl) {
        return;
      }

      setIsGenerating(true);
      setLastKey(currentKey);

      const resultBlob = await createCompositePreview();

      if (resultUrl && resultUrl.startsWith("blob:")) {
        URL.revokeObjectURL(resultUrl);
      }

      const localResultUrl = URL.createObjectURL(resultBlob);
      setPendingResultBlob(resultBlob);
      setResultUrl(localResultUrl);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function saveGeneratedResult() {
    try {
      if (!pendingResultBlob) {
        setError("No generated result to save.");
        return;
      }

      if (!user) {
        setError("You must be logged in to save outfits.");
        return;
      }

      setError(null);
      setIsSavingResult(true);

      const resultFile = new File(
        [pendingResultBlob],
        `tryon-result-${Date.now()}.jpg`,
        { type: "image/jpeg" }
      );

      const resultPublicUrl = await uploadFileToSupabase(resultFile, "results");

      const { error: insertError } = await supabase.from("outfits").insert({
        user_id: user.id,
        image_url: resultPublicUrl,
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      if (resultUrl && resultUrl.startsWith("blob:")) {
        URL.revokeObjectURL(resultUrl);
      }

      setResultUrl(resultPublicUrl);
      setPendingResultBlob(null);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSavingResult(false);
    }
  }

  function discardGeneratedResult() {
    if (resultUrl && resultUrl.startsWith("blob:")) {
      URL.revokeObjectURL(resultUrl);
    }

    setPendingResultBlob(null);
    setResultUrl(null);
    setError(null);
    setLastKey(null);
  }

  function clearAvatar() {
    setAvatar(null);
    setAvatarUrl(null);

    writeTryOnStorage({
      avatarUrl: null,
    });

    localStorage.removeItem("selectedAvatar");
  }

  function clearClothing() {
    setClothing(null);
    setClothingUrl(null);
    setClothingInputUrl("");
    setPendingResultBlob(null);
    setLastKey(null);

    if (resultUrl && resultUrl.startsWith("blob:")) {
      URL.revokeObjectURL(resultUrl);
    }
    setResultUrl(null);

    localStorage.removeItem("selectedClothing");
  }

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-5 sm:py-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Try On
          </h1>
          <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            Upload your photo, choose a clothing item, and preview the look before buying.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex items-start gap-3">
            <SectionBadge value="1" />
            <div className="min-w-0 space-y-1">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Upload your photo
              </div>
              <div className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                Choose a clear front-facing image, or pick one from outfits.
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <ImageUpload
              label="Your avatar photo"
              helpText={isPreparingAvatar ? "Preparing image..." : "PNG, JPG, or WEBP (max 10MB)."}
              value={avatar}
              onChange={handleAvatarChange}
            />

            {avatarUrl && !avatar && (
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <div className="aspect-[4/5] w-full">
                  <img
                    src={avatarUrl}
                    alt="Selected avatar"
                    className="block h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
                  <button
                    onClick={clearAvatar}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-900 dark:border-zinc-700 dark:text-zinc-50"
                  >
                    Remove avatar
                  </button>
                </div>
              </div>
            )}

            <ButtonLink href="/outfits" variant="secondary" className="w-full">
              From outfits
            </ButtonLink>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex items-start gap-3">
            <SectionBadge value="2" />
            <div className="min-w-0 space-y-1">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Choose your outfit
              </div>
              <div className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                Upload a clothing item, paste an image URL, or pick one from wardrobe or wishlist.
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <ImageUpload
              label="Upload clothing item"
              helpText={isPreparingClothing ? "Preparing image..." : "PNG, JPG, or WEBP (max 10MB)."}
              value={clothing}
              onChange={handleClothingChange}
            />

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Or add item by URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={clothingInputUrl}
                  onChange={(e) => setClothingInputUrl(e.target.value)}
                  placeholder="Paste image URL..."
                  className="flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                />
                <button
                  type="button"
                  onClick={applyClothingUrl}
                  className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
                >
                  Add
                </button>
              </div>
            </div>

            {clothingUrl && !clothing && (
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <div className="aspect-[4/5] w-full">
                  <img
                    src={clothingUrl}
                    alt="Selected clothing"
                    className="block h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
                  <button
                    onClick={clearClothing}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-900 dark:border-zinc-700 dark:text-zinc-50"
                  >
                    Remove clothing
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <ButtonLink href="/wardrobe" variant="secondary" className="w-full">
                From wardrobe
              </ButtonLink>

              <ButtonLink href="/wishlist" variant="secondary" className="w-full">
                From wishlist
              </ButtonLink>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={saveItemToWishlist}
                disabled={!clothingUrl || isSavingWishlist || isPreparingClothing}
                className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-50"
              >
                {isSavingWishlist ? "Saving..." : "Save to wishlist"}
              </button>

              <button
                type="button"
                onClick={saveItemToWardrobe}
                disabled={!clothingUrl || isSavingWardrobe || isPreparingClothing}
                className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-50"
              >
                {isSavingWardrobe ? "Saving..." : "Save to wardrobe"}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        <button
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating || isPreparingAvatar || isPreparingClothing}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {isGenerating ? (
            <span className="inline-flex items-center gap-2">
              Generating preview
              <LoadingDots />
            </span>
          ) : (
            "Generate preview"
          )}
        </button>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex items-start gap-3">
            <SectionBadge value="3" />
            <div className="min-w-0 space-y-1">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Generated result
              </div>
              <div className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                Review the generated image and decide if you want to keep it.
              </div>
            </div>
          </div>

          <div className="mt-4">
            {isGenerating ? (
              <PreviewSkeleton />
            ) : resultUrl ? (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <img
                    src={resultUrl}
                    alt="Generated try-on result"
                    className="block h-auto max-h-[32rem] w-full object-contain bg-white dark:bg-zinc-950"
                    loading="lazy"
                  />
                </div>

                {pendingResultBlob ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      onClick={saveGeneratedResult}
                      disabled={isSavingResult || loading}
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
                    >
                      {isSavingResult ? (
                        <span className="inline-flex items-center gap-2">
                          Saving
                          <LoadingDots />
                        </span>
                      ) : (
                        "Save to outfits"
                      )}
                    </button>

                    <button
                      onClick={discardGeneratedResult}
                      disabled={isSavingResult}
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-900 transition disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-50"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                    This result is already saved in your outfits.
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-3">
                <div className="aspect-[4/5] w-full rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950" />
                <div className="rounded-xl border border-dashed border-zinc-300 px-4 py-4 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                  Upload your photo and select a clothing item to see your generated image here.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}