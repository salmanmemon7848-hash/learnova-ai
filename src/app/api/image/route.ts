import { NextRequest, NextResponse } from "next/server";
import { analyzeImageWithGemini } from "@/lib/gemini-vision";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const question = (formData.get("question") as string) || "Analyze this image.";
    const imageFile = formData.get("image") as File | null;
    const imageUrl = formData.get("imageUrl") as string | null;

    let result: string;

    if (imageFile && typeof imageFile !== "string") {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      result = await analyzeImageWithGemini({
        imageBuffer: buffer,
        imageMimeType: imageFile.type,
        userQuestion: question,
      });
    } else if (imageUrl) {
      result = await analyzeImageWithGemini({
        imageUrl,
        userQuestion: question,
      });
    } else {
      return NextResponse.json({ error: "No image provided." }, { status: 400 });
    }

    return NextResponse.json({ answer: result });
  } catch (err: any) {
    console.error("Image analysis error:", err);
    return NextResponse.json({ error: err.message || "Failed to analyze image" }, { status: 500 });
  }
}
