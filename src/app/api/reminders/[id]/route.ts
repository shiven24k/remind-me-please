import { db } from "@/lib/db";
import { reminders } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("dismiss") }),
  z.object({
    action: z.literal("snooze"),
    snoozeMinutes: z.number().int().min(1).max(1440),
  }),
]);

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

  const parsed = ActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  if (parsed.data.action === "dismiss") {
    await db.update(reminders).set({ fired: true }).where(eq(reminders.id, id));
  } else {
    const snoozeUntil = new Date(
      Date.now() + parsed.data.snoozeMinutes * 60 * 1000
    );
    await db.update(reminders).set({ snoozeUntil }).where(eq(reminders.id, id));
  }

  return NextResponse.json({ success: true });
}
