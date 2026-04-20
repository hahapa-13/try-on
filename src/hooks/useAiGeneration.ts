"use client";

import { useCallback, useRef, useState } from "react";

export type GenerationStatus =
  | "idle"
  | "starting"
  | "running"
  | "succeeded"
  | "failed";

type UseAiGenerationReturn = {
  generate: (avatarUrl: string, clothingUrl: string) => Promise<void>;
  status: GenerationStatus;
  resultUrl: string | null;
  errorMessage: string | null;
  reset: () => void;
};

export function useAiGeneration(): UseAiGenerationReturn {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mountedRef = useRef(true);

  // No useEffect needed — no timers or subscriptions in direct generation

  const reset = useCallback(() => {
    if (!mountedRef.current) return;
    setStatus("idle");
    setResultUrl(null);
    setErrorMessage(null);
  }, []);

  const generate = useCallback(
    async (avatarUrl: string, clothingUrl: string): Promise<void> => {
      if (!mountedRef.current) return;

      setStatus("starting");
      setResultUrl(null);
      setErrorMessage(null);

      try {
        setStatus("running");

        const res = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarUrl, clothingUrl }),
        });

        const data = await res.json();

        if (!mountedRef.current) return;

        if (!res.ok) {
          setStatus("failed");
          setErrorMessage(
            data.error ?? `Generation failed (HTTP ${res.status}).`
          );
          return;
        }

        if (!data.resultUrl) {
          setStatus("failed");
          setErrorMessage("Generation succeeded but no result URL was returned.");
          return;
        }

        setResultUrl(data.resultUrl);
        setStatus("succeeded");
      } catch {
        if (!mountedRef.current) return;
        setStatus("failed");
        setErrorMessage("Network error during generation. Please try again.");
      }
    },
    []
  );

  return { generate, status, resultUrl, errorMessage, reset };
}