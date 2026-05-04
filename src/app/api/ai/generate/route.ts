import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const GEMINI_API_URL =
"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

async function fetchImageAsBase64(
  url: string
): Promise<{ base64: string; mimeType: string }> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch image (HTTP ${res.status}): ${url}`);
  }
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const mimeType = contentType.split(";")[0].trim();
  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return { base64, mimeType };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const avatarUrl: string = (body.avatarUrl ?? "").trim();
    const clothingUrl: string = (body.clothingUrl ?? "").trim();

    if (!avatarUrl || !clothingUrl) {
      return NextResponse.json(
        { error: "avatarUrl and clothingUrl are required." },
        { status: 400 }
      );
    }

    // Get API key from ai_connections
    const { data: connection, error: connError } = await supabase
      .from("ai_connections")
      .select("encrypted_key")
      .eq("user_id", user.id)
      .eq("provider", "gemini")
      .eq("is_connected", true)
      .maybeSingle();

    if (connError) {
      return NextResponse.json({ error: connError.message }, { status: 500 });
    }

    if (!connection) {
      return NextResponse.json(
        { error: "No Gemini API key found. Please add your key in Settings → AI." },
        { status: 422 }
      );
    }

    const apiKey = connection.encrypted_key;

    // Fetch both images as base64
    let avatarImage: { base64: string; mimeType: string };
    let clothingImage: { base64: string; mimeType: string };

    try {
      [avatarImage, clothingImage] = await Promise.all([
        fetchImageAsBase64(avatarUrl),
        fetchImageAsBase64(clothingUrl),
      ]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch images.";
      return NextResponse.json({ error: message }, { status: 502 });
    }

    // Call Gemini API
    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
                {
                  text: `
              TASK: High-precision photorealistic virtual try-on image editing.
              
              You are editing an existing real photo, not generating a new scene.
              
              INPUT:
              - Image 1: person photo
              - Image 2: garment photo
              
              GOAL:
              Replace only the relevant clothing area on the person with the provided garment and create a realistic final photo.
              
              STRICT RULES:
              - Preserve the person's identity, face, hair, skin tone, body shape, pose, hands, legs, feet, and background exactly.
              - Preserve the original camera angle, framing, crop, perspective, composition, and zoom exactly.
              - Preserve original body proportions exactly.
              - Do not reshape, resize, stretch, slim, enlarge, or distort any body part.
              - Do not generate a new person.
              - Do not generate a new pose.
              - Do not change the background or scene.
              - Do not add extra garments, accessories, layers, or design details not visible in the garment image.
              
              GARMENT LOGIC:
              - Automatically determine whether the garment is upper-body, lower-body, or full-body.
              - Apply it only to the correct body region.
              - Replace only the corresponding clothing area.
              - Keep all unrelated regions unchanged.
              
              GARMENT FIDELITY:
              - Preserve the garment's real shape, structure, fit, texture, seams, folds, stitching, edges, material behavior, logos, graphics, and visible design details.
              - Do not simplify the garment.
              - Do not invent missing details.
              - Keep the garment visually faithful to the product image.
              
              FIT AND ANATOMY:
              - Fit the garment naturally to the existing body and pose.
              - Respect anatomy and posture exactly.
              - Keep collars, sleeves, shoulders, waistlines, hems, pant legs, and openings aligned correctly.
              - Preserve natural drape, tension, compression, and folds where relevant.
              - Avoid floating fabric, clipping, duplication, warped geometry, or broken edges.
              
              REALISM:
              - Match the original image lighting, shadow direction, contrast, color balance, and depth.
              - Add realistic contact shadows where needed.
              - Blend seamlessly into the original photo.
              - Preserve a real photographic look.
              - Avoid blur, halos, ghosting, double edges, fake folds, over-smoothing, and visible AI artifacts.
              
              OUTPUT:
              - Return one single final photorealistic edited image only.
              - No text.
              - No explanation.
              - No labels.
              - No comparison panel.
                  `,
                },
                {
                  inlineData: {
                    mimeType: avatarImage.mimeType,
                    data: avatarImage.base64,
                  },
                },
                {
                  inlineData: {
                    mimeType: clothingImage.mimeType,
                    data: clothingImage.base64,
                  },
                },
              ],
          },
        ],
        generationConfig: {
          responseModalities: ["image", "text"],
          
        },
      }),
      cache: "no-store",
    });

    if (!geminiRes.ok) {
        const errorText = await geminiRes.text();
        console.error("[Gemini API error raw]", geminiRes.status, errorText);
      
        return NextResponse.json(
          {
            error: `Gemini API error (${geminiRes.status}): ${errorText}`,
          },
          { status: 502 }
        );
      }

    const geminiData = await geminiRes.json();

    // Extract the generated image from Gemini response
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> =
      geminiData?.candidates?.[0]?.content?.parts ?? [];

    const imagePart = parts.find((p) => p.inlineData?.data);

    if (!imagePart?.inlineData) {
      console.error("[Gemini] No image in response:", JSON.stringify(geminiData));
      return NextResponse.json(
        { error: "Gemini did not return an image. Try again or adjust your inputs." },
        { status: 502 }
      );
    }

    const { data: imageBase64, mimeType: imageMimeType } = imagePart.inlineData;

    // Upload result to Supabase Storage
    const imageBuffer = Buffer.from(imageBase64, "base64");
    const ext = imageMimeType.split("/")[1]?.split(";")[0]?.trim() ?? "png";
    const storagePath = `ai-results/${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("outfits")
      .upload(storagePath, imageBuffer, {
        contentType: imageMimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error("[Storage upload error]", uploadError);
      return NextResponse.json(
        { error: `Failed to store result: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("outfits")
      .getPublicUrl(storagePath);

    return NextResponse.json({ resultUrl: publicUrlData.publicUrl });
  } catch (err: unknown) {
    console.error("[POST /api/ai/generate]", err);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}