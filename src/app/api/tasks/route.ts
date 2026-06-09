import { db } from "@/lib/db";
import { tasks } from "@/lib/schema";
import { asc, desc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await db
    .select()
    .from(tasks)
    .orderBy(
      sql`CASE WHEN ${tasks.dueDate} IS NULL THEN 1 ELSE 0 END`,
      asc(tasks.dueDate),
      desc(tasks.createdAt)
    );

  return NextResponse.json({ tasks: rows });
}
