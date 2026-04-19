"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type GenerationStatus =
  | "idle"
  | "starting"
  | "running"
  | "succeeded"
  | "failed";

type JobPollResponse = {
  jobId: string;
  status: "pending" | "running" | "succeeded" | "failed" | "cancelled";
  resultUrl: string | null;
  errorMessage: string | null;
};

type UseAiGenerationReturn = {
  generate: (avatarUrl: string, clothingUrl: string) => Promise<void>;
  status: GenerationStatus;
  resultUrl: string | null;
  errorMessage: string | null;
  reset: () => void;
};

const POLL_INTERVAL_MS = 3_000;
const MAX_POLL_ATTEMPTS = 60; // 3 minutes

export function useAiGeneration(): UseAiGenerationReturn {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollCountRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (pollTimeoutRef.current !== null) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
    };
  }, []);

  const cancelPoll = useCallback(() => {
    if (pollTimeoutRef.current !== null) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    pollCountRef.current = 0;
  }, []);

  const reset = useCallback(() => {
    cancelPoll();
    if (!mountedRef.current) return;
    setStatus("idle");
    setResultUrl(null);
    setErrorMessage(null);
  }, [cancelPoll]);

  const failWith = useCallback(
    (message: string) => {
      cancelPoll();
      if (!mountedRef.current) return;
      setStatus("failed");
      setErrorMessage(message);
    },
    [cancelPoll]
  );

  const pollJob = useCallback(
    async (jobId: string): Promise<void> => {
      if (!mountedRef.current) return;

      if (pollCountRef.current >= MAX_POLL_ATTEMPTS) {
        failWith("Generation timed out after 3 minutes. Please try again.");
        return;
      }

      pollCountRef.current += 1;

      let data: JobPollResponse;
      try {
        const res = await fetch(`/api/ai/jobs/${jobId}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok) {
          failWith(json.error ?? `Polling failed (HTTP ${res.status}).`);
          return;
        }
        data = json as JobPollResponse;
      } catch {
        failWith("Network error while checking generation status.");
        return;
      }

      if (!mountedRef.current) return;

      if (data.status === "succeeded") {
        if (!data.resultUrl) {
          failWith("Generation succeeded but no result URL was returned.");
          return;
        }
        setResultUrl(data.resultUrl);
        setStatus("succeeded");
        cancelPoll();
        return;
      }

      if (data.status === "failed" || data.status === "cancelled") {
        failWith(
          data.errorMessage ??
            `Generation ${data.status}. Please try again.`
        );
        return;
      }

      // Still in progress — schedule next poll
      setStatus("running");
      pollTimeoutRef.current = setTimeout(
        () => pollJob(jobId),
        POLL_INTERVAL_MS
      );
    },
    [cancelPoll, failWith]
  );

  const generate = useCallback(
    async (avatarUrl: string, clothingUrl: string): Promise<void> => {
      reset();
      if (!mountedRef.current) return;

      setStatus("starting");

      let jobId: string;
      try {
        const res = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarUrl, clothingUrl }),
        });
        const data = await res.json();
        if (!res.ok) {
          failWith(
            data.error ?? `Failed to start generation (HTTP ${res.status}).`
          );
          return;
        }
        if (!data.jobId) {
          failWith("Server did not return a job ID.");
          return;
        }
        jobId = data.jobId;
      } catch {
        failWith("Network error while starting generation.");
        return;
      }

      if (!mountedRef.current) return;

      setStatus("running");
      pollTimeoutRef.current = setTimeout(
        () => pollJob(jobId),
        POLL_INTERVAL_MS
      );
    },
    [reset, failWith, pollJob]
  );

  return { generate, status, resultUrl, errorMessage, reset };
}