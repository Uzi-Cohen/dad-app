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
      promptText: prompt ?? "Professional high-end fashion video with a real fashion model wearing the dress, walking on a luxury runway or elegant urban setting, cinematic lighting, photorealistic, 4K quality, smooth camera movement",
      promptImage: [
        { uri: image, position: "first" }
      ],
      ratio: "1920:1080",
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
