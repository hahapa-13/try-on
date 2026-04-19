"use client";

import { useState } from "react";
import { useAiConnection } from "@/hooks/useAiConnection";

export default function AiSettingsPage() {
  const { status, loading, error, saveKey, removeKey } = useAiConnection();

  const [apiKeyInput, setApiKeyInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSave() {
    const trimmed = apiKeyInput.trim();

    if (!trimmed) {
      setFormError("Please enter your Replicate API key.");
      return;
    }

    if (!trimmed.startsWith("r8_")) {
      setFormError('Replicate API keys start with "r8_". Please check your key.');
      return;
    }

    setFormError(null);
    setSuccessMessage(null);
    setSaving(true);

    const err = await saveKey(trimmed);
    setSaving(false);

    if (err) {
      setFormError(err);
    } else {
      setApiKeyInput("");
      setSuccessMessage("Replicate connected successfully.");
    }
  }

  async function handleRemove() {
    setFormError(null);
    setSuccessMessage(null);
    setRemoving(true);

    const err = await removeKey();
    setRemoving(false);

    if (err) {
      setFormError(err);
    } else {
      setSuccessMessage("Replicate disconnected.");
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
            Connect your Replicate account to enable AI-powered try-on
            generation. Your API key is encrypted before storage and is never
            returned to the browser.
          </p>
        </div>

        <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Replicate
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Runs IDM-VTON — open-source virtual try-on model
              </p>
            </div>

            {loading ? (
              <div className="h-6 w-24 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
            ) : (
              <span
                className={[
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  status?.connected
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
                ].join(" ")}
              >
                {status?.connected ? "Connected" : "Not connected"}
              </span>
            )}
          </div>

          {status?.connected && status.keyHint && (
            <div className="rounded-xl bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
              Active key: {status.keyHint}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
              {formError}
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700 dark:border-green-900/40 dark:bg-green-950/40 dark:text-green-300">
              {successMessage}
            </div>
          )}

          {!loading && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="replicate-key"
                  className="text-xs font-semibold text-zinc-900 dark:text-zinc-50"
                >
                  {status?.connected ? "Replace API key" : "API key"}
                </label>

                <input
                  id="replicate-key"
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => {
                    setApiKeyInput(e.target.value);
                    setFormError(null);
                    setSuccessMessage(null);
                  }}
                  placeholder="r8_••••••••••••••••••••••••••••••••"
                  autoComplete="off"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                />

                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  Get your key at{" "}
                  <a
                    href="https://replicate.com/account/api-tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    replicate.com/account/api-tokens
                  </a>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || removing}
                  className="flex-1 rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
                >
                  {saving
                    ? "Validating & saving..."
                    : status?.connected
                      ? "Update key"
                      : "Connect"}
                </button>

                {status?.connected && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={saving || removing}
                    className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-50"
                  >
                    {removing ? "Removing..." : "Disconnect"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-800">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            How it works
          </p>

          <ol className="list-inside list-decimal space-y-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            <li>
              Create a free account at{" "}
              <a
                href="https://replicate.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                replicate.com
              </a>
            </li>
            <li>Copy your API token from your account settings</li>
            <li>Paste it above and click Connect</li>
            <li>
              Return to Try On — the Generate button will use real AI instead of
              the canvas preview
            </li>
          </ol>

          <div className="rounded-xl bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
            You are billed directly by Replicate per generation run. This app
            does not charge for your API usage.
          </div>
        </div>
      </div>
    </div>
  );
}