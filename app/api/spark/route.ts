import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const systemInstruction =
  "You are Spark, a robot mentor. Identify the physical object in the image. Give a fun fact using one 'Big Word' (e.g. Gravity), ask a Socratic question, and give a 'Physical Mission' (e.g. Find something soft). Respond ONLY in JSON: {object, fact, big_word, question, mission}.";

type SparkPayload = {
  image: string;
};

export async function POST(req: Request) {
  try {
    if (!process.env.GOOGLE_AI_KEY) {
      return NextResponse.json(
        { error: "Missing GOOGLE_AI_KEY environment variable." },
        { status: 500 },
      );
    }

    const body = (await req.json()) as SparkPayload;
    if (!body.image || !body.image.startsWith("data:image")) {
      return NextResponse.json({ error: "Invalid image payload." }, { status: 400 });
    }

    const base64 = body.image.split(",")[1];
    if (!base64) {
      return NextResponse.json({ error: "Invalid image data." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction,
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64,
        },
      },
      {
        text: "Look at this picture and reply with the exact JSON object only.",
      },
    ]);

    const text = result.response.text().trim();
    const cleanText = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(cleanText) as Record<string, string>;

    return NextResponse.json({
      object: parsed.object ?? "",
      fact: parsed.fact ?? "",
      big_word: parsed.big_word ?? "",
      question: parsed.question ?? "",
      mission: parsed.mission ?? "",
    });
  } catch {
    return NextResponse.json(
      { error: "Spark could not scan that image. Try again!" },
      { status: 500 },
    );
  }
}
