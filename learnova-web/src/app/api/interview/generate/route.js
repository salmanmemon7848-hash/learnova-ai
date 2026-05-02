import { generateInterviewQuestions } from "@/lib/groqInterviewService";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { jobRole, experienceLevel, interviewType, numberOfQuestions, language } = body;

    if (!jobRole || !language) {
      return NextResponse.json(
        { error: "jobRole and language are required" },
        { status: 400 }
      );
    }

    const questions = await generateInterviewQuestions({
      jobRole,
      experienceLevel: experienceLevel || "Mid-level",
      interviewType: interviewType || "General",
      numberOfQuestions: numberOfQuestions || 5,
      language,
    });

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate questions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ questions, language, total: questions.length });

  } catch (error) {
    console.error("[Learnova API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
