import * as chrono from "chrono-node";
import { z } from "zod";

export type ExtractedTask = {
  title: string;
  dueDate: Date | null;
  priority: "high" | "medium" | "low";
};

const OllamaExtractionSchema = z.object({
  isTask: z.boolean(),
  title: z.string().min(1).max(200),
  dueDate: z.string().nullable().optional(),
  priority: z.enum(["high", "medium", "low"]).optional().default("medium"),
});

const SYSTEM_PROMPT = `You are a task extraction assistant. Analyze the user's message and respond ONLY with a JSON object. No explanation, no markdown, no prose — only the raw JSON object.

JSON schema:
{
  "isTask": boolean,
  "title": string,
  "dueDate": string | null,
  "priority": "high" | "medium" | "low"
}

Examples:
Input: "remind me to call mom at 5pm today"
Output: {"isTask":true,"title":"Call mom","dueDate":"2024-01-15T17:00:00.000Z","priority":"medium"}

Input: "the weather is nice today"
Output: {"isTask":false,"title":"","dueDate":null,"priority":"low"}

Input: "URGENT: submit the tax return by tomorrow noon"
Output: {"isTask":true,"title":"Submit tax return","dueDate":"2024-01-16T12:00:00.000Z","priority":"high"}`;

async function extractWithOllama(text: string): Promise<ExtractedTask | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(
      `${process.env.OLLAMA_BASE_URL ?? "http://localhost:11434"}/api/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL ?? "llama3.2",
          prompt: `${SYSTEM_PROMPT}\n\nUser message: "${text}"\n\nJSON:`,
          stream: false,
          format: "json",
          options: { temperature: 0.1, top_p: 0.9 },
        }),
      }
    );

    clearTimeout(timeout);
    if (!response.ok) return null;

    const data = await response.json();
    const parsed = JSON.parse(data.response);
    const validated = OllamaExtractionSchema.safeParse(parsed);

    if (!validated.success || !validated.data.isTask) return null;

    return {
      title: validated.data.title,
      dueDate: validated.data.dueDate ? new Date(validated.data.dueDate) : null,
      priority: validated.data.priority,
    };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

const TASK_KEYWORDS = [
  /\bremind me\b/i,
  /\bdon'?t forget\b/i,
  /\bneed to\b/i,
  /\bhave to\b/i,
  /\bmust\b/i,
  /\bschedule\b/i,
  /\bbuy\b/i,
  /\bcall\b/i,
  /\bemail\b/i,
  /\bpick up\b/i,
  /\bfinish\b/i,
  /\bcomplete\b/i,
  /\bsubmit\b/i,
  /\bsend\b/i,
  /\bbook\b/i,
  /\bpay\b/i,
];

const HIGH_PRIORITY_KEYWORDS = /\b(urgent|asap|immediately|critical|important|emergency)\b/i;
const LOW_PRIORITY_KEYWORDS = /\b(maybe|eventually|sometime|whenever|low priority)\b/i;

function extractWithHeuristics(text: string): ExtractedTask | null {
  const hasTaskSignal = TASK_KEYWORDS.some((regex) => regex.test(text));
  if (!hasTaskSignal) return null;

  const parsed = chrono.parse(text, new Date(), { forwardDate: true });
  const dueDate = parsed.length > 0 ? parsed[0].start.date() : null;

  let title = text;
  if (parsed.length > 0) {
    title = title.replace(parsed[0].text, "").trim();
  }

  title = title
    .replace(/^remind me (to\s*)?/i, "")
    .replace(/^don'?t forget (to\s*)?/i, "")
    .replace(/^(i\s+)?need to\s*/i, "")
    .replace(/^(i\s+)?have to\s*/i, "")
    .replace(/[,\s]+$/, "")
    .trim();

  title = title.charAt(0).toUpperCase() + title.slice(1);
  if (!title) title = "Task from message";

  let priority: "high" | "medium" | "low" = "medium";
  if (HIGH_PRIORITY_KEYWORDS.test(text)) priority = "high";
  else if (LOW_PRIORITY_KEYWORDS.test(text)) priority = "low";

  return { title, dueDate, priority };
}

export async function extractTask(text: string): Promise<ExtractedTask | null> {
  if (text.trim().length < 5) return null;

  const ollamaResult = await extractWithOllama(text);
  if (ollamaResult) return ollamaResult;

  return extractWithHeuristics(text);
}

export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.OLLAMA_BASE_URL ?? "http://localhost:11434"}/api/tags`,
      { signal: AbortSignal.timeout(2000) }
    );
    return response.ok;
  } catch {
    return false;
  }
}
