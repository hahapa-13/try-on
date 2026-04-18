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

    // Validate it is an http/https URL
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

    // Fetch the image server-side — no CORS restrictions here
    let fetchResponse: Response;
    try {
      fetchResponse = await fetch(imageUrl, {
        headers: {
          // Some CDNs require a browser-like User-Agent
          "User-Agent":
            "Mozilla/5.0 (compatible; FitMeBot/1.0; +https://fitme.ai)",
        },
        // next: { revalidate: 0 } — ensure no caching of the fetch
        cache: "no-store",
      });
    } catch (fetchErr: any) {
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
    if (!contentType.startsWith("image/")) {
      return NextResponse.json(
        { error: "The URL does not point to a valid image." },
        { status: 422 }
      );
    }

    const arrayBuffer = await fetchResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Derive extension from content-type
    const ext = contentType.split("/")[1]?.split(";")[0]?.trim() ?? "jpg";
    const filename = `imported-${Date.now()}.${ext}`;
    const filePath = `${folder}/${filename}`;

    // Upload to Supabase Storage using the server client
    const supabase = await createSupabaseServerClient();

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("outfits")
      .upload(filePath, buffer, {
        contentType,
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