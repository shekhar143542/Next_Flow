import { NextResponse } from "next/server";

import { runs } from "@trigger.dev/sdk";

import { helloWorldTask } from "@/trigger/example";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get("runId")?.trim() ?? "";

    if (!runId) {
      return NextResponse.json({ error: "Invalid runId" }, { status: 400 });
    }

    const run = await runs.retrieve<typeof helloWorldTask>(runId);
    const isCompleted = run.isCompleted;
    const outputs = isCompleted
      ? ((run.output?.outputs ?? {}) as Record<string, unknown>)
      : {};

    if (isCompleted) {
      const workflowId =
        typeof run.payload?.workflowId === "string" ? run.payload.workflowId : "";
      const status = run.isSuccess ? "success" : "failed";

      if (workflowId) {
        void prisma.run
          .upsert({
            where: { id: runId },
            create: {
              id: runId,
              workflowId,
              status,
              output: outputs,
              logs: run.isSuccess ? null : run.error ?? null,
            },
            update: {
              status,
              output: outputs,
              logs: run.isSuccess ? null : run.error ?? null,
            },
          })
          .catch((error) => {
            console.error("Failed to persist run output:", error);
          });
      } else {
        console.warn("Workflow ID missing for completed run", { runId });
      }
    }

    return NextResponse.json({
      status: isCompleted ? "completed" : "running",
      outputs,
    });
  } catch (error) {
    console.error("GET /api/workflow-status error:", error);
    const details = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to retrieve workflow status", details },
      { status: 500 }
    );
  }
}
