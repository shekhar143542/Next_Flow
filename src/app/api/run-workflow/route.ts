import { NextResponse } from "next/server";

import { helloWorldTask } from "@/trigger/example";

export const runtime = "nodejs";

type RunWorkflowBody = {
  workflowId?: string;
};

export async function POST(request: Request) {
  try {
    let body: RunWorkflowBody = {};
    try {
      body = (await request.json()) as RunWorkflowBody;
    } catch {
      body = {};
    }

    const workflowId = typeof body.workflowId === "string" ? body.workflowId.trim() : "";

    if (!workflowId) {
      return NextResponse.json({ error: "Invalid workflowId" }, { status: 400 });
    }

    const handle = await helloWorldTask.trigger({ workflowId });

    return NextResponse.json({ success: true, jobId: handle.id });
  } catch (error) {
    console.error("POST /api/run-workflow error:", error);
    const details = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to trigger workflow", details },
      { status: 500 }
    );
  }
}
