import { db } from "@/lib/db";
import { tasks } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const PatchSchema = z.object({
  status: z.enum(["pending", "done", "snoozed"]).optional(),
  title: z.string().min(1).max(200).optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  dueDate: z.string().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { dueDate, ...rest } = parsed.data;
  const updates: Record<string, unknown> = {
    ...rest,
    updatedAt: new Date(),
    ...(dueDate !== undefined && {
      dueDate: dueDate ? new Date(dueDate) : null,
    }),
  };

  await db.update(tasks).set(updates).where(eq(tasks.id, id));
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(tasks).where(eq(tasks.id, id));
  return NextResponse.json({ success: true });
}
