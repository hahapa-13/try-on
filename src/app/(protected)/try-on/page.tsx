/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { ImageUpload } from "@/components/ImageUpload";
import { ButtonLink } from "@/components/ui/Button";
import { compressImage } from "@/lib/image";
import { ensureMyProfile, getMyProfile } from "@/lib/profile";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AvatarSource =
  | "none"
  | "local-upload"
  | "session"
  | "outfits-selection"
  | "profile";

type TryOnStorage = {
  avatarUrl: string | null;
  avatarSource: AvatarSource;
  avatarRemoved: boolean;
  clothingUrl: string | null;
};

// ---------------------------------------------------------------------------
// SessionStorage helpers
// ---------------------------------------------------------------------------

const TRY_ON_STORAGE_KEY = "tryOnData";

const EMPTY_STORAGE: TryOnStorage = {
  avatarUrl: null,
  avatarSource: "none",
  avatarRemoved: false,
  clothingUrl: null,
};

function readTryOnStorage(): TryOnStorage {
  if (typeof window === "undefined") return { ...EMPTY_STORAGE };
  try {
    const raw = sessionStorage.getItem(TRY_ON_STORAGE_KEY);
    if (!raw) return { ...EMPTY_STORAGE };
    const parsed = JSON.parse(raw) as Partial<TryOnStorage>;
    return {
      avatarUrl: parsed.avatarUrl ?? null,
      avatarSource: parsed.avatarSource ?? "none",
      avatarRemoved: parsed.avatarRemoved ?? false,
      clothingUrl: parsed.clothingUrl ?? null,
    };
  } catch {
    return { ...EMPTY_STORAGE };
  }
}

function writeTryOnStorage(data: TryOnStorage) {
  if (typeof window === "undefined") return;
  // Safety: never persist blob URLs — they are tab-local and die on navigation
  const safe = {
    ...data,
    avatarUrl:
      data.avatarUrl && data.avatarUrl.startsWith("blob:")
        ? null
        : data.avatarUrl,
    clothingUrl:
      data.clothingUrl && data.clothingUrl.startsWith("blob:")
        ? null
        : data.clothingUrl,
  };
  sessionStorage.setItem(TRY_ON_STORAGE_KEY, JSON.stringify(safe));
}

// ---------------------------------------------------------------------------
// Small UI components
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TryOnPage() {
  const { user, loading } = useUser();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [mounted, setMounted] = useState(false);

  // profileEnsuredRef tracks the user.id it was last run for
  // so it resets automatically when a different user signs in.
  const profileEnsuredRef = useRef<string | null>(null);

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarSource, setAvatarSource] = useState<AvatarSource>("none");
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [isPreparingAvatar, setIsPreparingAvatar] = useState(false);

  // Clothing
  const [clothing, setClothing] = useState<File | null>(null);
  const [clothingUrl, setClothingUrl] = useState<string | null>(null);
  const [clothingInputUrl, setClothingInputUrl] = useState("");
  const [isPreparingClothing, setIsPreparingClothing] = useState(false);

  // Saving flags
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingWishlist, setIsSavingWishlist] = useState(false);
  const [isSavingWardrobe, setIsSavingWardrobe] = useState(false);
  const [isSavingResult, setIsSavingResult] = useState(false);

  // Result
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [pendingResultBlob, setPendingResultBlob] = useState<Blob | null>(null);
  const [lastKey, setLastKey] = useState<string | null>(null);

  // Blob URL refs — only used for transient in-memory preview, never persisted
  const avatarBlobRef = useRef<string | null>(null);
  const clothingBlobRef = useRef<string | null>(null);
  const resultBlobRef = useRef<string | null>(null);

  // ---------------------------------------------------------------------------
  // Mount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setMounted(true);
  }, []);

  // ---------------------------------------------------------------------------
  // On mount: resolve initial state from localStorage handoffs + sessionStorage
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!mounted) return;

    const stored = readTryOnStorage();

    // --- Avatar ---
    const localStorageAvatar = localStorage.getItem("selectedAvatar");
    localStorage.removeItem("selectedAvatar");

    if (localStorageAvatar) {
      // Handoff from outfits page — always a durable remote URL
      setAvatarUrl(localStorageAvatar);
      setAvatarSource("outfits-selection");
      setAvatarRemoved(false);
      writeTryOnStorage({
        ...stored,
        avatarUrl: localStorageAvatar,
        avatarSource: "outfits-selection",
        avatarRemoved: false,
      });
    } else if (stored.avatarRemoved) {
      setAvatarUrl(null);
      setAvatarSource("none");
      setAvatarRemoved(true);
    } else if (stored.avatarUrl) {
      // Only restore if it is a durable URL (blob: would be broken here anyway,
      // but writeTryOnStorage already guards against persisting blob: URLs)
      setAvatarUrl(stored.avatarUrl);
      setAvatarSource(stored.avatarSource !== "none" ? stored.avatarSource : "session");
      setAvatarRemoved(false);
    }

    // --- Clothing ---
    const localStorageClothing = localStorage.getItem("selectedClothing");
    localStorage.removeItem("selectedClothing");

    const nextClothingUrl = localStorageClothing ?? stored.clothingUrl ?? null;
    setClothingUrl(nextClothingUrl);
    setClothingInputUrl(nextClothingUrl ?? "");

    if (nextClothingUrl !== stored.clothingUrl) {
      writeTryOnStorage({
        ...readTryOnStorage(),
        clothingUrl: nextClothingUrl,
      });
    }
  }, [mounted]);

  // ---------------------------------------------------------------------------
  // Load profile avatar as fallback once per user session
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!mounted || !user) return;
    if (profileEnsuredRef.current === user.id) return;

    profileEnsuredRef.current = user.id;
    let cancelled = false;

    async function loadProfileAvatar() {
      try {
        await ensureMyProfile({
          id: user!.id,
          email: user!.email ?? null,
        });

        const profile = await getMyProfile(user!.id);
        if (cancelled) return;

        const profileAvatar = profile?.avatar_url ?? null;
        setProfileAvatarUrl(profileAvatar);

        if (!profileAvatar) return;

        const stored = readTryOnStorage();
        if (!stored.avatarUrl && !stored.avatarRemoved) {
          setAvatarUrl(profileAvatar);
          setAvatarSource("profile");
          setAvatarRemoved(false);
          writeTryOnStorage({
            ...stored,
            avatarUrl: profileAvatar,
            avatarSource: "profile",
            avatarRemoved: false,
          });
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Failed to load profile avatar.");
        }
      }
    }

    loadProfileAvatar();
    return () => {
      cancelled = true;
    };
  }, [mounted, user]);

  // ---------------------------------------------------------------------------
  // Cleanup all blob URLs on unmount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      if (avatarBlobRef.current) URL.revokeObjectURL(avatarBlobRef.current);
      if (clothingBlobRef.current) URL.revokeObjectURL(clothingBlobRef.current);
      if (resultBlobRef.current) URL.revokeObjectURL(resultBlobRef.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Derived UI flags
  // ---------------------------------------------------------------------------

  const canGenerate = Boolean(avatarUrl && clothingUrl);

  const showUseProfileAvatarButton =
    !avatarRemoved &&
    profileAvatarUrl !== null &&
    avatarUrl !== profileAvatarUrl;

  // ---------------------------------------------------------------------------
  // Supabase Storage upload helper
  // ---------------------------------------------------------------------------

  async function uploadFileToSupabase(file: File, folder: string): Promise<string> {
    const filePath = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    const { data, error } = await supabase.storage
      .from("outfits")
      .upload(filePath, file);

    if (error) throw new Error(error.message);

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

  // ---------------------------------------------------------------------------
  // Composite preview
  // ---------------------------------------------------------------------------

  async function createCompositePreview(): Promise<Blob> {
    if (!avatarUrl || !clothingUrl) {
      throw new Error("Missing avatar or clothing image.");
    }

    const [avatarImg, clothingImg] = await Promise.all([
      loadImage(avatarUrl),
      loadImage(clothingUrl),
    ]);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create canvas context.");

    const MAX_WIDTH = 900;
    const originalWidth = avatarImg.naturalWidth || avatarImg.width;
    const originalHeight = avatarImg.naturalHeight || avatarImg.height;
    const scale = Math.min(1, MAX_WIDTH / originalWidth);

    canvas.width = Math.round(originalWidth * scale);
    canvas.height = Math.round(originalHeight * scale);

    ctx.drawImage(avatarImg, 0, 0, canvas.width, canvas.height);

    const overlayWidth = canvas.width * 0.7;
    const overlayX = canvas.width / 2 - overlayWidth / 2;
    const overlayY = canvas.height * 0.44 - overlayWidth / 2;

    ctx.globalAlpha = 0.72;
    ctx.drawImage(clothingImg, overlayX, overlayY, overlayWidth, overlayWidth);
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

  // ---------------------------------------------------------------------------
  // Avatar handlers
  // ---------------------------------------------------------------------------

  async function handleAvatarChange(file: File | null) {
    setError(null);
    if (!file) {
      clearAvatar();
      return;
    }

    try {
      setIsPreparingAvatar(true);

      // 1. Compress
      const compressed = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1600,
        quality: 0.84,
        mimeType: "image/jpeg",
      });

      // 2. Show a transient blob preview immediately while upload runs
      if (avatarBlobRef.current) {
        URL.revokeObjectURL(avatarBlobRef.current);
        avatarBlobRef.current = null;
      }
      const blobPreviewUrl = URL.createObjectURL(compressed);
      avatarBlobRef.current = blobPreviewUrl;
      setAvatarUrl(blobPreviewUrl); // temporary — gives instant feedback
      setAvatarSource("local-upload");
      setAvatarRemoved(false);

      // 3. Upload to Supabase Storage — get a durable public URL
      const durableUrl = await uploadFileToSupabase(
        compressed,
        "avatar-uploads"
      );

      // 4. Replace blob preview with durable URL, revoke the blob
      if (avatarBlobRef.current) {
        URL.revokeObjectURL(avatarBlobRef.current);
        avatarBlobRef.current = null;
      }

      setAvatarUrl(durableUrl);
      setAvatarSource("local-upload");
      setAvatarRemoved(false);

      // 5. Persist only the durable URL
      const stored = readTryOnStorage();
      writeTryOnStorage({
        ...stored,
        avatarUrl: durableUrl,
        avatarSource: "local-upload",
        avatarRemoved: false,
      });
    } catch (err: any) {
      // On failure, clear the broken blob preview
      if (avatarBlobRef.current) {
        URL.revokeObjectURL(avatarBlobRef.current);
        avatarBlobRef.current = null;
      }
      setAvatarUrl(null);
      setAvatarSource("none");
      setError(err.message || "Failed to upload avatar image.");
    } finally {
      setIsPreparingAvatar(false);
    }
  }

  function applyProfileAvatar() {
    if (!profileAvatarUrl) return;

    if (avatarBlobRef.current) {
      URL.revokeObjectURL(avatarBlobRef.current);
      avatarBlobRef.current = null;
    }

    setAvatarUrl(profileAvatarUrl);
    setAvatarSource("profile");
    setAvatarRemoved(false);

    const stored = readTryOnStorage();
    writeTryOnStorage({
      ...stored,
      avatarUrl: profileAvatarUrl,
      avatarSource: "profile",
      avatarRemoved: false,
    });
  }

  function clearAvatar() {
    if (avatarBlobRef.current) {
      URL.revokeObjectURL(avatarBlobRef.current);
      avatarBlobRef.current = null;
    }

    setAvatarUrl(null);
    setAvatarSource("none");
    setAvatarRemoved(true);

    const stored = readTryOnStorage();
    writeTryOnStorage({
      ...stored,
      avatarUrl: null,
      avatarSource: "none",
      avatarRemoved: true,
    });

    localStorage.removeItem("selectedAvatar");
  }

  // ---------------------------------------------------------------------------
  // Clothing handlers
  // ---------------------------------------------------------------------------

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

      // Transient blob preview
      if (clothingBlobRef.current) {
        URL.revokeObjectURL(clothingBlobRef.current);
        clothingBlobRef.current = null;
      }
      const blobPreviewUrl = URL.createObjectURL(compressed);
      clothingBlobRef.current = blobPreviewUrl;
      setClothing(compressed);
      setClothingUrl(blobPreviewUrl);
      setClothingInputUrl("");

      // Upload for durable URL
      const durableUrl = await uploadFileToSupabase(
        compressed,
        "clothing-uploads"
      );

      if (clothingBlobRef.current) {
        URL.revokeObjectURL(clothingBlobRef.current);
        clothingBlobRef.current = null;
      }

      setClothing(null); // file uploaded — no longer needed in memory
      setClothingUrl(durableUrl);

      const stored = readTryOnStorage();
      writeTryOnStorage({ ...stored, clothingUrl: durableUrl });
    } catch (err: any) {
      if (clothingBlobRef.current) {
        URL.revokeObjectURL(clothingBlobRef.current);
        clothingBlobRef.current = null;
      }
      setClothing(null);
      setClothingUrl(null);
      setError(err.message || "Failed to upload clothing image.");
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

    if (clothingBlobRef.current) {
      URL.revokeObjectURL(clothingBlobRef.current);
      clothingBlobRef.current = null;
    }

    setError(null);
    setClothing(null);
    setClothingUrl(trimmed);

    const stored = readTryOnStorage();
    writeTryOnStorage({ ...stored, clothingUrl: trimmed });
  }

  function clearClothing() {
    if (clothingBlobRef.current) {
      URL.revokeObjectURL(clothingBlobRef.current);
      clothingBlobRef.current = null;
    }

    setClothing(null);
    setClothingUrl(null);
    setClothingInputUrl("");

    const stored = readTryOnStorage();
    writeTryOnStorage({ ...stored, clothingUrl: null });
    localStorage.removeItem("selectedClothing");
  }

  // ---------------------------------------------------------------------------
  // Save to wishlist / wardrobe
  // ---------------------------------------------------------------------------

  async function saveItemToWishlist() {
    try {
      setError(null);
      setIsSavingWishlist(true);

      if (!user) {
        setError("You must be logged in to save to wishlist.");
        return;
      }

      // clothingUrl is always a durable URL at this point
      // (blob uploads are resolved before setting clothingUrl)
      if (!clothingUrl || clothingUrl.startsWith("blob:")) {
        setError("Please wait for the clothing image to finish uploading.");
        return;
      }

      const { error } = await supabase.from("wishlist").insert({
        user_id: user.id,
        image_url: clothingUrl,
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

      if (!clothingUrl || clothingUrl.startsWith("blob:")) {
        setError("Please wait for the clothing image to finish uploading.");
        return;
      }

      const { error } = await supabase.from("wardrobe").insert({
        user_id: user.id,
        image_url: clothingUrl,
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

  // ---------------------------------------------------------------------------
  // Generate preview
  // ---------------------------------------------------------------------------

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
      if (avatarUrl.startsWith("blob:") || clothingUrl.startsWith("blob:")) {
        setError("Please wait for images to finish uploading.");
        return;
      }

      const currentKey = `${avatarUrl}-${clothingUrl}`;
      if (currentKey === lastKey && resultUrl) return;

      setIsGenerating(true);
      setLastKey(currentKey);

      const resultBlob = await createCompositePreview();

      if (resultBlobRef.current) {
        URL.revokeObjectURL(resultBlobRef.current);
        resultBlobRef.current = null;
      }

      const localResultUrl = URL.createObjectURL(resultBlob);
      resultBlobRef.current = localResultUrl;

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

      if (resultBlobRef.current) {
        URL.revokeObjectURL(resultBlobRef.current);
        resultBlobRef.current = null;
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
    if (resultBlobRef.current) {
      URL.revokeObjectURL(resultBlobRef.current);
      resultBlobRef.current = null;
    }
    setPendingResultBlob(null);
    setResultUrl(null);
    setLastKey(null);
    setError(null);
  }

  // ---------------------------------------------------------------------------
  // Render guard
  // ---------------------------------------------------------------------------

  if (!mounted) return null;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

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

        {/* ------------------------------------------------------------------ */}
        {/* Step 1 — Avatar                                                     */}
        {/* ------------------------------------------------------------------ */}
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
            {/*
              value={null} always — prevents ImageUpload's internal preview
              from rendering alongside our single controlled preview card.
            */}
            <ImageUpload
              label="Your avatar photo"
              helpText={
                isPreparingAvatar
                  ? "Uploading avatar..."
                  : "PNG, JPG, or WEBP (max 10MB)."
              }
              value={null}
              onChange={handleAvatarChange}
            />

            {/* Single controlled avatar preview */}
            {avatarUrl && (
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <div className="aspect-[4/5] w-full">
                  {isPreparingAvatar ? (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-900">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Uploading…
                      </span>
                    </div>
                  ) : (
                    <img
                      src={avatarUrl}
                      alt="Selected avatar"
                      className="block h-full w-full object-contain"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
                  <button
                    onClick={clearAvatar}
                    disabled={isPreparingAvatar}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-50"
                  >
                    Remove avatar
                  </button>

                  {showUseProfileAvatarButton && (
                    <button
                      onClick={applyProfileAvatar}
                      disabled={isPreparingAvatar}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-50"
                    >
                      Use profile avatar
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* No active avatar: offer profile avatar only if not explicitly removed */}
            {!avatarUrl && showUseProfileAvatarButton && (
              <button
                onClick={applyProfileAvatar}
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-900 dark:border-zinc-700 dark:text-zinc-50"
              >
                Use profile avatar
              </button>
            )}

            <ButtonLink href="/outfits" variant="secondary" className="w-full">
              From outfits
            </ButtonLink>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Step 2 — Clothing                                                   */}
        {/* ------------------------------------------------------------------ */}
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
              helpText={
                isPreparingClothing
                  ? "Uploading clothing..."
                  : "PNG, JPG, or WEBP (max 10MB)."
              }
              value={null}
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

            {/* Single controlled clothing preview */}
            {clothingUrl && (
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <div className="aspect-[4/5] w-full">
                  {isPreparingClothing ? (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-900">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Uploading…
                      </span>
                    </div>
                  ) : (
                    <img
                      src={clothingUrl}
                      alt="Selected clothing"
                      className="block h-full w-full object-contain"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
                  <button
                    onClick={clearClothing}
                    disabled={isPreparingClothing}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-50"
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

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={onGenerate}
          disabled={
            !canGenerate ||
            isGenerating ||
            isPreparingAvatar ||
            isPreparingClothing
          }
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

        {/* ------------------------------------------------------------------ */}
        {/* Step 3 — Generated result                                           */}
        {/* ------------------------------------------------------------------ */}
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