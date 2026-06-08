import { extractTask, checkOllamaHealth } from "@/lib/extractor";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.text || typeof body.text !== "string") {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  const result = await extractTask(body.text);
  return NextResponse.json({ task: result });
}

export async function GET() {
  const healthy = await checkOllamaHealth();
  return NextResponse.json({ ollamaAvailable: healthy });
}
