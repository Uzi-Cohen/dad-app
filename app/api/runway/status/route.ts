import { NextResponse } from "next/server";
import RunwayML from "@runwayml/sdk";

export const runtime = "nodejs";

const client = new RunwayML({
  apiKey: process.env.RUNWAY_API_KEY || 'key_977cd32665ec7400b5efd903b602f862c8e5b275bcb6c0ab5d7edcc3d6b1544d3f07c6f82727cf5f42fd674a30560312c31ef840ea39ec51e37364f3f0cdedf8',
});

export async function POST(req: Request) {
  try {
    const { taskId } = await req.json();

    if (!taskId) {
      return NextResponse.json({ error: "taskId required" }, { status: 400 });
    }

    const task = await client.tasks.retrieve(taskId);

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
