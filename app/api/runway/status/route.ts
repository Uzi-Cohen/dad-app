import { NextResponse } from "next/server";
import RunwayML from "@runwayml/sdk";

export const runtime = "nodejs";

const client = new RunwayML({
  apiKey: process.env.RUNWAY_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { taskId } = await req.json();

    if (!taskId) {
      return NextResponse.json({ error: "taskId required" }, { status: 400 });
    }

    const task = await client.tasks.get(taskId);

    console.log("TASK STATUS:", task.id, task.status, task.progress);

    return NextResponse.json(task);
  } catch (e: any) {
    console.error("STATUS ERROR:", e);
    return NextResponse.json(
      { error: e.message ?? "status failed" },
      { status: 500 }
    );
  }
}
