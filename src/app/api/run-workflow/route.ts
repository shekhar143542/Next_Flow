import { NextResponse } from "next/server";

import { runs } from "@trigger.dev/sdk";

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
    const run = await runs.poll<typeof helloWorldTask>(handle, { pollIntervalMs: 500 });

    if (!run.isSuccess) {
      console.error("Trigger.dev run failed:", run.status);
      return NextResponse.json(
        { error: "Failed to run workflow", details: run.status },
        { status: 500 }
      );
    }

    const outputs = (run.output?.outputs ?? {}) as Record<string, unknown>;

    console.log("FINAL OUTPUTS:", outputs);

    return NextResponse.json({ success: true, outputs });
  } catch (error) {
    console.error("POST /api/run-workflow error:", error);
    const details = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to trigger workflow", details },
      { status: 500 }
    );
  }
}
