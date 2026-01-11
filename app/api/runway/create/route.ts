import { NextResponse } from "next/server";
import RunwayML from "@runwayml/sdk";

export const runtime = "nodejs";

const client = new RunwayML({
  apiKey: process.env.RUNWAY_API_KEY || 'key_977cd32665ec7400b5efd903b602f862c8e5b275bcb6c0ab5d7edcc3d6b1544d3f07c6f82727cf5f42fd674a30560312c31ef840ea39ec51e37364f3f0cdedf8',
});

export async function POST(req: Request) {
  try {
    const { image, prompt } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "image required" }, { status: 400 });
    }

    const task = await client.imageToVideo.create({
      model: "gen4_turbo",
      promptText: prompt ?? "Elegant fashion product video",
      promptImage: [
        { uri: image, position: "first" }
      ],
      ratio: "1280:720",
      duration: 4,
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
