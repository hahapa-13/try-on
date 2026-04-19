"use client";

import { useEffect, useState, useCallback } from "react";

export type AiConnectionStatus = {
  connected: boolean;
  isDefault: boolean;
  keyHint: string | null;
};

type UseAiConnectionReturn = {
  status: AiConnectionStatus | null;
  loading: boolean;
  error: string | null;
  saveKey: (apiKey: string) => Promise<string | null>;
  removeKey: () => Promise<string | null>;
  refresh: () => Promise<void>;
};

export function useAiConnection(): UseAiConnectionReturn {
  const [status, setStatus] = useState<AiConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/ai/connect", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to load AI connection status.");
        return;
      }
      setStatus({
        connected: json.connected ?? false,
        isDefault: json.isDefault ?? false,
        keyHint: json.keyHint ?? null,
      });
    } catch {
      setError("Failed to load AI connection status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const saveKey = useCallback(
    async (apiKey: string): Promise<string | null> => {
      try {
        const res = await fetch("/api/ai/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey }),
        });
        const json = await res.json();
        if (!res.ok) return json.error ?? "Failed to save key.";
        await fetchStatus();
        return null;
      } catch {
        return "Failed to save key.";
      }
    },
    [fetchStatus]
  );

  const removeKey = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/ai/connect", { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) return json.error ?? "Failed to remove key.";
      await fetchStatus();
      return null;
    } catch {
      return "Failed to remove key.";
    }
  }, [fetchStatus]);

  return { status, loading, error, saveKey, removeKey, refresh: fetchStatus };
}