export type ReplicatePredictionStatus =
  | "starting"
  | "processing"
  | "succeeded"
  | "failed"
  | "canceled";

export type ReplicatePrediction = {
  id: string;
  status: ReplicatePredictionStatus;
  output?: string[] | null;
  error?: string | null;
  urls: {
    get: string;
    cancel: string;
  };
};

function getModelVersion(): string {
  const version = process.env.REPLICATE_MODEL_VERSION;
  if (!version) {
    throw new Error("REPLICATE_MODEL_VERSION is not set.");
  }
  return version;
}

export async function validateReplicateKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.replicate.com/v1/account", {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function startVtonPrediction(
  apiKey: string,
  avatarUrl: string,
  clothingUrl: string
): Promise<ReplicatePrediction> {
  const res = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: getModelVersion(),
      input: {
        human_img: avatarUrl,
        garm_img: clothingUrl,
        garment_des: "clothing item",
        is_checked: true,
        is_checked_crop: false,
        denoise_steps: 30,
        seed: 42,
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Replicate ${res.status}: ${text}`);
  }

  return res.json() as Promise<ReplicatePrediction>;
}

export async function getPrediction(
  apiKey: string,
  predictionId: string
): Promise<ReplicatePrediction> {
  const res = await fetch(
    `https://api.replicate.com/v1/predictions/${predictionId}`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Replicate ${res.status}: ${text}`);
  }

  return res.json() as Promise<ReplicatePrediction>;
}