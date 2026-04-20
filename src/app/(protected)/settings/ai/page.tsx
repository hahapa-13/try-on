"use client";

import { useState } from "react";

export default function AiSettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSave() {
    const trimmed = apiKey.trim();

    if (!trimmed) {
      setErrorMessage("Please enter your Gemini API key.");
      return;
    }

    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/ai/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "gemini", apiKey: trimmed }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(json.error ?? "Failed to save API key.");
        return;
      }

      setApiKey("");
      setSuccessMessage("API key saved successfully.");
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto w-full max-w-lg px-4 py-8">

        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            AI Settings
          </h1>
          <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            Connect your Gemini API key to enable AI-powered try-on generation.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-800 space-y-4">

          <div className="space-y-1.5">
            <label
              htmlFor="gemini-key"
              className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Gemini API Key
            </label>
            <input
              id="gemini-key"
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setSuccessMessage(null);
                setErrorMessage(null);
              }}
              placeholder="AIza••••••••••••••••••••••••••••••••••••••"
              autoComplete="off"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
  Get your key at{" "}
  <a
    href="https://aistudio.google.com/app/apikey"
    target="_blank"
    rel="noopener noreferrer"
    className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
  >
    aistudio.google.com
  </a>
</p>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700 dark:border-green-900/40 dark:bg-green-950/40 dark:text-green-300">
              {successMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="w-full rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
          >
            {loading ? "Saving…" : "Save API Key"}
          </button>
        </div>

      </div>
    </div>
  );
}