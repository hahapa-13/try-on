import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const imageUrl: string = body.imageUrl ?? "";
    const folder: string = body.folder ?? "clothing-uploads";

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "imageUrl is required." },
        { status: 400 }
      );
    }

    let parsed: URL;
    try {
      parsed = new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { error: "imageUrl is not a valid URL." },
        { status: 400 }
      );
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return NextResponse.json(
        { error: "Only http and https URLs are supported." },
        { status: 400 }
      );
    }

    let fetchResponse: Response;
    try {
      fetchResponse = await fetch(imageUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
          Referer: imageUrl,
        },
        cache: "no-store",
      });
    } catch {
      return NextResponse.json(
        {
          error:
            "Could not reach the image URL. Please check the URL or upload the image manually.",
        },
        { status: 502 }
      );
    }

    if (!fetchResponse.ok) {
      return NextResponse.json(
        {
          error: `Remote server returned ${fetchResponse.status}. Please upload the image manually.`,
        },
        { status: 502 }
      );
    }

    const contentType = fetchResponse.headers.get("content-type") ?? "";

    const isLikelyImage =
      contentType.startsWith("image/") ||
      /\.(jpg|jpeg|png|webp|avif|gif)(\?|$)/i.test(imageUrl);

    if (!isLikelyImage) {
      return NextResponse.json(
        { error: "The URL does not appear to be an image." },
        { status: 422 }
      );
    }

    const arrayBuffer = await fetchResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let ext = contentType.split("/")[1]?.split(";")[0]?.trim() ?? "";

    if (!ext) {
      const match = imageUrl.match(/\.(jpg|jpeg|png|webp|avif|gif)(\?|$)/i);
      ext = match?.[1]?.toLowerCase() ?? "jpg";
    }

    const safeExt = ext.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
    const filename = `imported-${Date.now()}.${safeExt}`;
    const filePath = `${folder}/${filename}`;

    const supabase = await createSupabaseServerClient();

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("outfits")
      .upload(filePath, buffer, {
        contentType: contentType.startsWith("image/")
          ? contentType
          : `image/${safeExt}`,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("outfits")
      .getPublicUrl(uploadData.path);

    return NextResponse.json({ publicUrl: publicUrlData.publicUrl });
  } catch (err: any) {
    console.error("[import-image]", err);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}