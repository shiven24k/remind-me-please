import { db } from "@/lib/db";
import { messages, tasks } from "@/lib/schema";
import { asc, desc, sql } from "drizzle-orm";
import ChatShell from "@/components/ChatInterface";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [initialMessages, initialTasks] = await Promise.all([
    db.select().from(messages).orderBy(asc(messages.timestamp)).limit(100),
    db
      .select()
      .from(tasks)
      .orderBy(
        sql`CASE WHEN ${tasks.dueDate} IS NULL THEN 1 ELSE 0 END`,
        asc(tasks.dueDate),
        desc(tasks.createdAt)
      ),
  ]);

  return <ChatShell initialMessages={initialMessages} initialTasks={initialTasks} />;
}
