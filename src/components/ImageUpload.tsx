"use client";

import { useEffect, useRef, useState } from "react";

type ImageUploadProps = {
  label: string;
  helpText?: string;
  value: File | null;
  onChange: (file: File | null) => void;
};

export function ImageUpload({
  label,
  helpText,
  value,
  onChange,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(value);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [value]);

  function handleFile(file: File | null) {
    if (!file) {
      onChange(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be smaller than 10MB.");
      return;
    }

    onChange(file);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    handleFile(file);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0] ?? null;
    handleFile(file);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleRemove() {
    onChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {label}
        </label>
        {helpText ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{helpText}</p>
        ) : null}
      </div>

      {previewUrl ? (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="aspect-[4/5] w-full">
            <img
              src={previewUrl}
              alt={label}
              className="block h-full w-full object-contain"
              loading="lazy"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-3 py-3 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Replace
            </button>

            <button
              type="button"
              onClick={handleRemove}
              className="rounded-xl bg-black px-3 py-2 text-sm font-medium text-white transition hover:opacity-90 dark:bg-zinc-50 dark:text-zinc-900"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={[
            "cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition",
            isDragging
              ? "border-black bg-zinc-100 dark:border-zinc-50 dark:bg-zinc-900"
              : "border-zinc-300 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900",
          ].join(" ")}
        >
          <div className="space-y-2">
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Drag & drop your photo
            </div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              or browse files
            </div>
            <div className="text-xs text-zinc-400 dark:text-zinc-500">
              PNG, JPG, or WEBP (max 10MB)
            </div>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}