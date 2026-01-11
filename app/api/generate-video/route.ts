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
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    if (!process.env.RUNWAY_API_KEY) {
      return NextResponse.json(
        { error: "RUNWAY_API_KEY not set" },
        { status: 500 }
      );
    }

    // ✅ OFFICIAL Runway SDK call (this is the key fix)
    const task = await client.imageToVideo
      .create({
        model: "gen4_turbo",
        promptText: prompt ?? "Elegant fashion product video, smooth cinematic camera motion",
        promptImage: [
          {
            uri: image,
            position: "first",
          },
        ],
        ratio: "1280:720",
        duration: 4,
      })
      .waitForTaskOutput();

    return NextResponse.json({
      status: "completed",
      output: task,
    });
  } catch (err: any) {
    console.error("Runway SDK error:", err);
    return NextResponse.json(
      { error: err.message ?? "Video generation failed" },
      { status: 500 }
    );
  }
}
