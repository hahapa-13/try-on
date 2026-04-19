/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { useAiConnection } from "@/hooks/useAiConnection";
import { useAiGeneration } from "@/hooks/useAiGeneration";
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
  const safe: TryOnStorage = {
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
// URL classification helpers
// ---------------------------------------------------------------------------

function isSupabaseStorageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname.endsWith(".supabase.co") &&
      parsed.pathname.includes("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}

function isExternalRemoteUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("blob:")) return false;
  if (isSupabaseStorageUrl(url)) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Server-side image import helper
// ---------------------------------------------------------------------------

async function importExternalImageViaServer(
  imageUrl: string,
  folder = "clothing-uploads"
): Promise<string> {
  const res = await fetch("/api/import-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl, folder }),
  });
  const json = await res.json();
  if (!res.ok || !json.publicUrl) {
    throw new Error(
      json.error || "Failed to import the image. Please upload it manually."
    );
  }
  return json.publicUrl as string;
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

  const { status: aiStatus } = useAiConnection();
  const aiGeneration = useAiGeneration();
  const aiConnected = aiStatus?.connected ?? false;

  const [mounted, setMounted] = useState(false);
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

  // Canvas fallback result state
  const [canvasResultUrl, setCanvasResultUrl] = useState<string | null>(null);
  const [pendingResultBlob, setPendingResultBlob] = useState<Blob | null>(null);
  const [lastKey, setLastKey] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  // Blob URL refs — transient in-memory only, never persisted
  const avatarBlobRef = useRef<string | null>(null);
  const clothingBlobRef = useRef<string | null>(null);
  const canvasBlobRef = useRef<string | null>(null);

  // ---------------------------------------------------------------------------
  // resetGeneratedState — clears both AI and canvas result state
  // ---------------------------------------------------------------------------

  function resetGeneratedState() {
    aiGeneration.reset();

    if (canvasBlobRef.current) {
      URL.revokeObjectURL(canvasBlobRef.current);
      canvasBlobRef.current = null;
    }
    setCanvasResultUrl(null);
    setPendingResultBlob(null);
    setLastKey(null);
    setError(null);
  }

  // ---------------------------------------------------------------------------
  // Mount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const stored = readTryOnStorage();
    const localStorageAvatar = localStorage.getItem("selectedAvatar");
    localStorage.removeItem("selectedAvatar");

    if (localStorageAvatar) {
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
      setAvatarUrl(stored.avatarUrl);
      setAvatarSource(
        stored.avatarSource !== "none" ? stored.avatarSource : "session"
      );
      setAvatarRemoved(false);
    }

    const localStorageClothing = localStorage.getItem("selectedClothing");
    localStorage.removeItem("selectedClothing");
    const nextClothingUrl = localStorageClothing ?? stored.clothingUrl ?? null;
    setClothingUrl(nextClothingUrl);
    setClothingInputUrl(nextClothingUrl ?? "");
    if (nextClothingUrl !== stored.clothingUrl) {
      writeTryOnStorage({ ...readTryOnStorage(), clothingUrl: nextClothingUrl });
    }
  }, [mounted]);

  // ---------------------------------------------------------------------------
  // Window focus re-sync
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!mounted) return;

    function syncSelectedItems() {
      const selectedAvatar = localStorage.getItem("selectedAvatar");
      const selectedClothing = localStorage.getItem("selectedClothing");

      if (selectedAvatar) {
        localStorage.removeItem("selectedAvatar");
        resetGeneratedState();
        if (avatarBlobRef.current) {
          URL.revokeObjectURL(avatarBlobRef.current);
          avatarBlobRef.current = null;
        }
        setAvatarUrl(selectedAvatar);
        setAvatarSource("outfits-selection");
        setAvatarRemoved(false);
        const stored = readTryOnStorage();
        writeTryOnStorage({
          ...stored,
          avatarUrl: selectedAvatar,
          avatarSource: "outfits-selection",
          avatarRemoved: false,
        });
      }

      if (selectedClothing) {
        localStorage.removeItem("selectedClothing");
        resetGeneratedState();
        if (clothingBlobRef.current) {
          URL.revokeObjectURL(clothingBlobRef.current);
          clothingBlobRef.current = null;
        }
        setClothing(null);
        setClothingUrl(selectedClothing);
        setClothingInputUrl(selectedClothing);
        const stored = readTryOnStorage();
        writeTryOnStorage({ ...stored, clothingUrl: selectedClothing });
      }
    }

    window.addEventListener("focus", syncSelectedItems);
    return () => window.removeEventListener("focus", syncSelectedItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // ---------------------------------------------------------------------------
  // Profile avatar
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!mounted || !user) return;
    if (profileEnsuredRef.current === user.id) return;
    profileEnsuredRef.current = user.id;
    let cancelled = false;

    async function loadProfileAvatar() {
      try {
        await ensureMyProfile({ id: user!.id, email: user!.email ?? null });
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
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to load profile avatar.";
          setError(message);
        }
      }
    }

    loadProfileAvatar();
    return () => {
      cancelled = true;
    };
  }, [mounted, user]);

  // ---------------------------------------------------------------------------
  // Cleanup blob URLs on unmount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      if (avatarBlobRef.current) URL.revokeObjectURL(avatarBlobRef.current);
      if (clothingBlobRef.current) URL.revokeObjectURL(clothingBlobRef.current);
      if (canvasBlobRef.current) URL.revokeObjectURL(canvasBlobRef.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Derived flags
  // ---------------------------------------------------------------------------

  const canGenerate = Boolean(avatarUrl && clothingUrl);

  const clothingIsUploading =
    isPreparingClothing ||
    (!!clothingUrl && clothingUrl.startsWith("blob:"));

  const showUseProfileAvatarButton =
    !avatarRemoved &&
    profileAvatarUrl !== null &&
    avatarUrl !== profileAvatarUrl;

  const generationIsActive =
    isGenerating ||
    aiGeneration.status === "starting" ||
    aiGeneration.status === "running";

  // ---------------------------------------------------------------------------
  // Upload helper
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

  async function ensureClothingStoredInSupabase(
    currentUrl: string
  ): Promise<string> {
    if (isSupabaseStorageUrl(currentUrl)) return currentUrl;
    if (currentUrl.startsWith("blob:")) {
      throw new Error(
        "Clothing image is still uploading. Please wait a moment."
      );
    }
    if (isExternalRemoteUrl(currentUrl)) {
      const durableUrl = await importExternalImageViaServer(
        currentUrl,
        "clothing-uploads"
      );
      setClothingUrl(durableUrl);
      setClothingInputUrl(durableUrl);
      const stored = readTryOnStorage();
      writeTryOnStorage({ ...stored, clothingUrl: durableUrl });
      return durableUrl;
    }
    return currentUrl;
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
    resetGeneratedState();
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
      if (avatarBlobRef.current) {
        URL.revokeObjectURL(avatarBlobRef.current);
        avatarBlobRef.current = null;
      }
      const blobPreviewUrl = URL.createObjectURL(compressed);
      avatarBlobRef.current = blobPreviewUrl;
      setAvatarUrl(blobPreviewUrl);
      setAvatarSource("local-upload");
      setAvatarRemoved(false);
      const durableUrl = await uploadFileToSupabase(
        compressed,
        "avatar-uploads"
      );
      if (avatarBlobRef.current) {
        URL.revokeObjectURL(avatarBlobRef.current);
        avatarBlobRef.current = null;
      }
      setAvatarUrl(durableUrl);
      setAvatarSource("local-upload");
      setAvatarRemoved(false);
      const stored = readTryOnStorage();
      writeTryOnStorage({
        ...stored,
        avatarUrl: durableUrl,
        avatarSource: "local-upload",
        avatarRemoved: false,
      });
    } catch (err: unknown) {
      if (avatarBlobRef.current) {
        URL.revokeObjectURL(avatarBlobRef.current);
        avatarBlobRef.current = null;
      }
      setAvatarUrl(null);
      setAvatarSource("none");
      const message =
        err instanceof Error ? err.message : "Failed to upload avatar image.";
      setError(message);
    } finally {
      setIsPreparingAvatar(false);
    }
  }

  function applyProfileAvatar() {
    if (!profileAvatarUrl) return;
    resetGeneratedState();
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
    resetGeneratedState();
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
    resetGeneratedState();
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
      if (clothingBlobRef.current) {
        URL.revokeObjectURL(clothingBlobRef.current);
        clothingBlobRef.current = null;
      }
      const blobPreviewUrl = URL.createObjectURL(compressed);
      clothingBlobRef.current = blobPreviewUrl;
      setClothing(compressed);
      setClothingUrl(blobPreviewUrl);
      setClothingInputUrl("");
      const durableUrl = await uploadFileToSupabase(
        compressed,
        "clothing-uploads"
      );
      if (clothingBlobRef.current) {
        URL.revokeObjectURL(clothingBlobRef.current);
        clothingBlobRef.current = null;
      }
      setClothing(null);
      setClothingUrl(durableUrl);
      const stored = readTryOnStorage();
      writeTryOnStorage({ ...stored, clothingUrl: durableUrl });
    } catch (err: unknown) {
      if (clothingBlobRef.current) {
        URL.revokeObjectURL(clothingBlobRef.current);
        clothingBlobRef.current = null;
      }
      setClothing(null);
      setClothingUrl(null);
      const message =
        err instanceof Error
          ? err.message
          : "Failed to upload clothing image.";
      setError(message);
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
    resetGeneratedState();
    if (clothingBlobRef.current) {
      URL.revokeObjectURL(clothingBlobRef.current);
      clothingBlobRef.current = null;
    }
    setClothing(null);
    setClothingUrl(trimmed);
    setClothingInputUrl(trimmed);
    const stored = readTryOnStorage();
    writeTryOnStorage({ ...stored, clothingUrl: trimmed });
  }

  function clearClothing() {
    resetGeneratedState();
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
      if (!clothingUrl) {
        setError("Please select a clothing item first.");
        return;
      }
      const durableUrl = await ensureClothingStoredInSupabase(clothingUrl);
      const { error } = await supabase.from("wishlist").insert({
        user_id: user.id,
        image_url: durableUrl,
      });
      if (error) {
        setError(error.message);
        return;
      }
      alert("Saved to wishlist!");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
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
      if (!clothingUrl) {
        setError("Please select a clothing item first.");
        return;
      }
      const durableUrl = await ensureClothingStoredInSupabase(clothingUrl);
      const { error } = await supabase.from("wardrobe").insert({
        user_id: user.id,
        image_url: durableUrl,
      });
      if (error) {
        setError(error.message);
        return;
      }
      alert("Saved to wardrobe!");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setIsSavingWardrobe(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Generate — AI path or canvas fallback
  // ---------------------------------------------------------------------------

  async function onGenerate() {
    // Generation lock — prevent duplicate runs
    if (generationIsActive) return;

    // --- Input validation BEFORE any state reset ---
    if (!avatarUrl) {
      setError("Please upload your photo or select an avatar from outfits.");
      return;
    }
    if (!clothingUrl) {
      setError("Please select a clothing item.");
      return;
    }
    if (avatarUrl.startsWith("blob:")) {
      setError("Please wait for the avatar to finish uploading.");
      return;
    }
    if (clothingUrl.startsWith("blob:")) {
      setError("Please wait for the clothing image to finish uploading.");
      return;
    }

    // Debug logs
    console.log("AI Connected:", aiConnected);
    console.log("Avatar URL:", avatarUrl);
    console.log("Clothing URL:", clothingUrl);

    // Validation passed — now safe to reset previous result
    resetGeneratedState();
    setIsGenerating(true);

    try {
      // Ensure clothing is durably stored before any generation path
      let finalClothingUrl = clothingUrl;
      if (isExternalRemoteUrl(clothingUrl)) {
        finalClothingUrl = await ensureClothingStoredInSupabase(clothingUrl);
      }

      if (aiConnected) {
        // --- AI path ---
        // Avatar must already be a Supabase Storage URL for AI generation
        if (!isSupabaseStorageUrl(avatarUrl)) {
          setError(
            "Your avatar must be a saved Supabase Storage URL to use AI generation. Please re-upload."
          );
          return;
        }

        // Clothing must be a Supabase Storage URL for AI generation
        if (!isSupabaseStorageUrl(finalClothingUrl)) {
          setError(
            "Clothing must be uploaded to storage before AI generation. Please save it first."
          );
          return;
        }

        // Hand off to AI generation hook.
        // Do NOT call setIsGenerating(false) here — the finally block handles it.
        await aiGeneration.generate(avatarUrl, finalClothingUrl);
        return;
      }

      // --- Canvas fallback path ---
      const currentKey = `${avatarUrl}-${finalClothingUrl}`;
      if (currentKey === lastKey && canvasResultUrl) return;

      setLastKey(currentKey);

      const resultBlob = await createCompositePreview();

      if (canvasBlobRef.current) {
        URL.revokeObjectURL(canvasBlobRef.current);
        canvasBlobRef.current = null;
      }

      const localResultUrl = URL.createObjectURL(resultBlob);
      canvasBlobRef.current = localResultUrl;
      setPendingResultBlob(resultBlob);
      setCanvasResultUrl(localResultUrl);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Save generated result to outfits
  // ---------------------------------------------------------------------------

  async function saveGeneratedResult() {
    if (!user) {
      setError("You must be logged in to save outfits.");
      return;
    }

    // AI result — already stored in Supabase Storage by the job route
    if (aiGeneration.resultUrl) {
      try {
        setIsSavingResult(true);
        setError(null);

        const { error: insertError } = await supabase.from("outfits").insert({
          user_id: user.id,
          image_url: aiGeneration.resultUrl,
        });

        if (insertError) {
          setError(insertError.message);
          return;
        }

        aiGeneration.reset();
        alert("Saved to outfits!");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
        setError(message);
      } finally {
        setIsSavingResult(false);
      }

      return;
    }

    // Canvas result — upload blob first
    if (!pendingResultBlob) {
      setError("No generated result to save.");
      return;
    }
    try {
      setIsSavingResult(true);
      setError(null);
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
      if (canvasBlobRef.current) {
        URL.revokeObjectURL(canvasBlobRef.current);
        canvasBlobRef.current = null;
      }
      setCanvasResultUrl(resultPublicUrl);
      setPendingResultBlob(null);
      alert("Saved to outfits!");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setIsSavingResult(false);
    }
  }

  function discardGeneratedResult() {
    resetGeneratedState();
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
            Upload your photo, choose a clothing item, and preview the look
            before buying.
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
                Upload a clothing item, paste an image URL, or pick one from
                wardrobe or wishlist.
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <ImageUpload
              label="Upload clothing item"
              helpText={
                clothingIsUploading
                  ? "Uploading clothing..."
                  : "PNG, JPG, or WEBP (max 10MB)."
              }
              value={null}
              onChange={handleClothingChange}
            />

            <div className="space-y-2">
              <label
                htmlFor="clothing-url-input"
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
              >
                Or add item by URL
              </label>
              <div className="flex gap-2">
                <input
                  id="clothing-url-input"
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

            {clothingUrl && (
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <div className="aspect-[4/5] w-full">
                  {clothingIsUploading ? (
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
                    disabled={clothingIsUploading}
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
                disabled={!clothingUrl || isSavingWishlist || clothingIsUploading}
                className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-50"
              >
                {isSavingWishlist ? "Saving..." : "Save to wishlist"}
              </button>

              <button
                type="button"
                onClick={saveItemToWardrobe}
                disabled={!clothingUrl || isSavingWardrobe || clothingIsUploading}
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

        {aiGeneration.errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
            {aiGeneration.errorMessage}
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={onGenerate}
          disabled={
            !canGenerate ||
            isGenerating ||
            aiGeneration.status === "starting" ||
            aiGeneration.status === "running" ||
            isPreparingAvatar ||
            clothingIsUploading
          }
          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {generationIsActive ? (
            <span className="inline-flex items-center gap-2">
              {aiConnected ? "Generating with AI" : "Generating preview"}
              <LoadingDots />
            </span>
          ) : (
            aiConnected ? "Generate with AI" : "Generate preview"
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
            {generationIsActive ? (
              <PreviewSkeleton />
            ) : (aiGeneration.resultUrl ?? canvasResultUrl) ? (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <img
                    src={aiGeneration.resultUrl ?? canvasResultUrl ?? ""}
                    alt="Generated try-on result"
                    className="block h-auto max-h-[32rem] w-full object-contain bg-white dark:bg-zinc-950"
                    loading="lazy"
                  />
                </div>

                {(pendingResultBlob !== null || aiGeneration.resultUrl !== null) ? (
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
                  Upload your photo and select a clothing item to see your
                  generated image here.
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}