import { NextResponse } from "next/server";
import RunwayML from "@runwayml/sdk";

export const runtime = "nodejs";

const client = new RunwayML({
  apiKey: process.env.RUNWAY_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { image, prompt } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "image required" }, { status: 400 });
    }

    const task = await client.imageToVideo.create({
      model: "gen4",
      promptText: prompt ?? "CRITICAL REQUIREMENT: The dress/outfit must remain 100% IDENTICAL to the reference image - do NOT change colors, do NOT change patterns, do NOT change fabric, do NOT change cut, do NOT change style, do NOT add or remove any design elements. ZERO modifications allowed to the clothing. Professional fashion model with smooth camera movement, luxury runway or elegant setting, cinematic professional lighting, photorealistic 4K quality. Only animate the model and camera - the dress stays exactly as shown in the image.",
      promptImage: [
        { uri: image, position: "first" }
      ],
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
