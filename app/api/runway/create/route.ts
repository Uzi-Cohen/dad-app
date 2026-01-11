import { NextResponse } from "next/server";
import RunwayML from "@runwayml/sdk";

export const runtime = "nodejs";

const client = new RunwayML({
  apiKey: process.env.RUNWAY_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { image, modelReference, prompt } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "image required" }, { status: 400 });
    }

    // Build prompt images array
    const promptImages: Array<{ uri: string; position?: string }> = [
      { uri: image, position: "first" }
    ];

    // Add model reference as second image if provided
    if (modelReference) {
      promptImages.push({ uri: modelReference });
    }

    const task = await client.imageToVideo.create({
      model: "gen4",
      promptText: prompt ?? "Professional fashion model wearing the EXACT dress shown in the image - preserve all original design details, colors, patterns, and fabric textures without any modifications. Smooth camera movement, luxury runway or elegant setting, cinematic professional lighting, photorealistic 4K quality. DO NOT change or alter the dress design in any way.",
      promptImage: promptImages,
      ratio: "1584:672",
      duration: 10,
    });

    console.log("TASK CREATED:", task.id, task.status);

    return NextResponse.json({
      taskId: task.id,
      status: task.status,
    });
  } catch (e: any) {
    console.error("CREATE ERROR:", e);
    return NextResponse.json(
      { error: e.message ?? "create failed" },
      { status: 500 }
    );
  }
}
