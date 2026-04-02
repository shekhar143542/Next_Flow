import { schemaTask } from "@trigger.dev/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

type NodeData = {
  text?: string;
  systemPrompt?: string;
  userMessage?: string;
  image?: string;
  imageUrl?: string;
  imagePreviewUrl?: string;
  video?: string;
  videoUrl?: string;
  videoPreviewUrl?: string;
  outputImage?: string;
  croppedImage?: string;
  [key: string]: unknown;
};

type NodeLike = { id: string; type?: string | null; data?: unknown };
type EdgeLike = { source: string; target: string };

const GEMINI_MODEL = "gemini-2.0-flash";

const getGeminiApiKey = (): string => {
  return process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY ?? "";
};

const coerceToText = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return "";
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const buildPrompt = (template: string, input: string): string => {
  const trimmedInput = input.trim();
  if (!template) {
    return trimmedInput;
  }

  if (template.includes("{{input}}")) {
    return template.replace(/{{input}}/g, trimmedInput);
  }

  if (!trimmedInput) {
    return template;
  }

  return `${template}\n\n${trimmedInput}`;
};

const callGemini = async (prompt: string): Promise<string> => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Missing Gemini API key");
  }

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: GEMINI_MODEL });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

const normalizeNodeData = (data: unknown): NodeData => {
  if (data && typeof data === "object") {
    return data as NodeData;
  }

  return {};
};

const getString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value;
  }

  return undefined;
};

const buildExecutionOrder = <TNode extends NodeLike, TEdge extends EdgeLike>(
  nodes: TNode[],
  edges: TEdge[]
): TNode[] => {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();
  const nodeIds = new Set<string>();

  for (const node of nodes) {
    nodeIds.add(node.id);
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      continue;
    }

    adjacency.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const node of nodes) {
    if ((inDegree.get(node.id) ?? 0) === 0) {
      queue.push(node.id);
    }
  }

  const orderedIds: string[] = [];
  const visited = new Set<string>();
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    if (visited.has(current)) {
      continue;
    }

    visited.add(current);
    orderedIds.push(current);

    for (const next of adjacency.get(current) ?? []) {
      const nextInDegree = (inDegree.get(next) ?? 0) - 1;
      inDegree.set(next, nextInDegree);
      if (nextInDegree === 0) {
        queue.push(next);
      }
    }
  }

  if (orderedIds.length < nodes.length) {
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        orderedIds.push(node.id);
        visited.add(node.id);
      }
    }
  }

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  return orderedIds
    .map((id) => nodeById.get(id))
    .filter((node): node is TNode => Boolean(node));
};

const groupEdgesByTarget = <TEdge extends EdgeLike>(edges: TEdge[]) => {
  const byTarget = new Map<string, TEdge[]>();

  for (const edge of edges) {
    const list = byTarget.get(edge.target);
    if (list) {
      list.push(edge);
    } else {
      byTarget.set(edge.target, [edge]);
    }
  }

  return byTarget;
};

export const helloWorldTask = schemaTask({
  id: "hello-world",
  schema: z.object({
    workflowId: z.string().min(1),
  }),
  run: async (payload) => {
    const workflow = await prisma.workflow.findUnique({
      where: { id: payload.workflowId },
      include: {
        nodes: true,
        edges: true,
      },
    });

    if (!workflow) {
      console.log("Workflow not found", { workflowId: payload.workflowId });
      throw new Error("Workflow not found");
    }

    console.log("Workflow loaded", {
      workflowId: workflow.id,
      nodes: workflow.nodes,
      edges: workflow.edges,
    });

    const orderedNodes = buildExecutionOrder(workflow.nodes, workflow.edges);

    console.log("Execution order:", orderedNodes);

    const outputs: Record<string, unknown> = {};
    const nodeById = new Map(workflow.nodes.map((node) => [node.id, node]));
    const incomingEdgesByTarget = groupEdgesByTarget(workflow.edges);

    for (const node of orderedNodes) {
      const incomingEdges = incomingEdgesByTarget.get(node.id) ?? [];
      const inputs = incomingEdges.map((edge) => {
        const sourceNode = nodeById.get(edge.source);
        return {
          sourceId: edge.source,
          sourceType: sourceNode?.type ?? null,
          output: outputs[edge.source],
        };
      });

      const data = normalizeNodeData(node.data);
      let output: unknown = null;

      switch (node.type) {
        case "text": {
          output = getString(data.text) ?? "default text";
          break;
        }
        case "image": {
          output =
            getString(data.image)
            ?? getString(data.imageUrl)
            ?? getString(data.imagePreviewUrl)
            ?? null;
          break;
        }
        case "video": {
          output =
            getString(data.video)
            ?? getString(data.videoUrl)
            ?? getString(data.videoPreviewUrl)
            ?? null;
          break;
        }
        case "frame": {
          output = "frame-from-video";
          break;
        }
        case "crop": {
          output = getString(data.outputImage) ?? getString(data.croppedImage) ?? null;
          break;
        }
        case "llm": {
          const inputText = inputs
            .map((input) => coerceToText(input.output).trim())
            .filter((value) => value.length > 0)
            .join("\n");
          const systemPrompt = getString(data.systemPrompt) ?? "";
          const userPrompt = getString(data.userMessage) ?? getString(data.text) ?? "";
          const promptTemplate = [systemPrompt, userPrompt].filter(Boolean).join("\n\n");
          const finalPrompt = buildPrompt(promptTemplate, inputText) || inputText;

          try {
            output = await callGemini(finalPrompt);
          } catch (error) {
            console.error("Gemini call failed:", error);
            output = "Error: Failed to generate response";
          }
          break;
        }
        default: {
          output = null;
        }
      }

      outputs[node.id] = output;

      console.log("Executing:", node.type ?? "unknown", node.id);
      console.log("Input:", inputs);
      console.log("Output:", output);
    }

    console.log("Final Outputs:", outputs);

    return {
      nodes: workflow.nodes,
      edges: workflow.edges,
      orderedNodes,
      outputs,
    };
  },
});