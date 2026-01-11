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
      promptText: prompt ?? "Professional fashion model wearing the EXACT dress shown in the image - preserve all original design details, colors, patterns, and fabric textures without any modifications. Smooth camera movement, luxury runway or elegant setting, cinematic professional lighting, photorealistic 4K quality. DO NOT change or alter the dress design in any way.",
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
