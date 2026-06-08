import { db } from "@/lib/db";
import { reminders, tasks } from "@/lib/schema";
import { and, eq, lte, isNull, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pendingOnly = searchParams.get("pending") === "true";

  const now = new Date();

  const rows = await db
    .select({ reminder: reminders, task: tasks })
    .from(reminders)
    .innerJoin(tasks, eq(reminders.taskId, tasks.id))
    .where(
      pendingOnly
        ? and(
            eq(reminders.fired, false),
            lte(reminders.fireAt, now),
            or(isNull(reminders.snoozeUntil), lte(reminders.snoozeUntil, now))
          )
        : undefined
    )
    .orderBy(reminders.fireAt);

  return NextResponse.json({ reminders: rows });
}
