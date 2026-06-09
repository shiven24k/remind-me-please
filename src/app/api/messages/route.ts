import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages, tasks, reminders } from "@/lib/schema";
import { extractTask } from "@/lib/extractor";
import { generateId } from "@/lib/utils";
import { asc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 100), 200);
  const offset = Number(searchParams.get("offset") ?? 0);

  const rows = await db
    .select()
    .from(messages)
    .orderBy(asc(messages.timestamp))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({ messages: rows });
}

export async function POST(request: NextRequest) {
  let body: { content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const content = body.content?.trim();
  if (!content || content.length === 0) {
    return NextResponse.json({ error: "Content required" }, { status: 400 });
  }
  if (content.length > 5000) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  const messageId = generateId();
  const now = new Date();

  const [extractedTask] = await Promise.all([
    extractTask(content),
    db.insert(messages).values({
      id: messageId,
      content,
      timestamp: now,
      metadata: { extractionAttempted: true, taskExtracted: false },
    }),
  ]);

  let insertedTask = null;
  let insertedReminder = null;

  if (extractedTask) {
    const taskId = generateId();
    const taskNow = new Date();

    await db.insert(tasks).values({
      id: taskId,
      messageId,
      title: extractedTask.title,
      dueDate: extractedTask.dueDate ?? undefined,
      priority: extractedTask.priority,
      status: "pending",
      createdAt: taskNow,
      updatedAt: taskNow,
    });

    insertedTask = {
      id: taskId,
      messageId,
      title: extractedTask.title,
      description: null,
      dueDate: extractedTask.dueDate,
      priority: extractedTask.priority,
      status: "pending" as const,
      createdAt: taskNow,
      updatedAt: taskNow,
    };

    if (extractedTask.dueDate) {
      const reminderId = generateId();
      await db.insert(reminders).values({
        id: reminderId,
        taskId,
        fireAt: extractedTask.dueDate,
        fired: false,
        createdAt: taskNow,
      });
      insertedReminder = { id: reminderId, fireAt: extractedTask.dueDate };
    }

    await db
      .update(messages)
      .set({ metadata: { extractionAttempted: true, taskExtracted: true } })
      .where(eq(messages.id, messageId));
  }

  return NextResponse.json(
    {
      message: { id: messageId, content, timestamp: now.toISOString() },
      task: insertedTask,
      reminder: insertedReminder,
    },
    { status: 201 }
  );
}
