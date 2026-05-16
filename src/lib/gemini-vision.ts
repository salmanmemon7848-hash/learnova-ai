import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genai = new GoogleGenerativeAI(apiKey);

const THINKIOR_VISION_PROMPT = `
You are Thinkior AI — an elite visual intelligence assistant built for students and founders.
When you receive an image, you MUST:
1. Scan the entire image completely — every corner, label, and detail.
2. Extract all visible text (OCR) — handwritten or printed.
3. Identify the image type: document, chart, photo, diagram, exam question, business doc, etc.
4. Answer ONLY based on what is actually visible — never hallucinate content.

RESPONSE RULES:
- Exam/problem image → solve step-by-step with explanation of WHY each step is done.
- Chart/graph → identify trends, anomalies, and give a clear insight summary.
- Document/screenshot → extract key content, summarize, then answer the question.
- Diagram/flowchart → explain the flow and components step-by-step.
- Business document → sharp strategic insights, flag risks or opportunities.
- Photo/scene → describe what is happening and answer the specific question.

LANGUAGE: Auto-detect from the user's message and respond in the same language.
NEVER say "I cannot read this image" — always attempt maximum extraction.
After answering, suggest 1-2 smart follow-up questions the user might find useful.
`;

/**
 * Convert file buffer → base64 inline data
 */
function bufferToBase64(buffer: Buffer, mimeType: string) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
}

/**
 * Convert image URL → base64 by fetching it
 */
async function urlToBase64(imageUrl: string) {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const mimeType = res.headers.get("content-type") || "image/jpeg";
  return bufferToBase64(buffer, mimeType);
}

export interface AnalyzeImageParams {
  imageBuffer?: Buffer;
  imageMimeType?: string;
  imageUrl?: string;
  userQuestion?: string;
}

/**
 * Main function — call this from your API routes
 */
export async function analyzeImageWithGemini({
  imageBuffer,
  imageMimeType,
  imageUrl,
  userQuestion,
}: AnalyzeImageParams): Promise<string> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }

  const model = genai.getGenerativeModel({
    model: "gemini-1.5-flash", // free tier
    systemInstruction: THINKIOR_VISION_PROMPT,
  });

  let imagePart;

  if (imageBuffer) {
    imagePart = bufferToBase64(imageBuffer, imageMimeType || "image/jpeg");
  } else if (imageUrl) {
    imagePart = await urlToBase64(imageUrl);
  } else {
    throw new Error("Provide either imageBuffer or imageUrl");
  }

  const result = await model.generateContent([
    imagePart,
    userQuestion || "Analyze this image.",
  ]);
  
  return result.response.text();
}
