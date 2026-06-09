"use client";

import { useState, useCallback } from "react";
import type { Message, Task } from "@/lib/schema";

export type MessageWithTask = {
  message: Message;
  task: Task | null;
  reminder: { id: string; fireAt: Date } | null;
};

export function useMessages(initial: Message[] = []) {
  const [messages, setMessages] = useState<MessageWithTask[]>(
    initial.map((m) => ({ message: m, task: null, reminder: null }))
  );
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    const res = await fetch("/api/messages?limit=100");
    if (!res.ok) return;
    const data = await res.json();
    setMessages(
      (data.messages as Message[]).map((m) => ({ message: m, task: null, reminder: null }))
    );
  }, []);

  const sendMessage = useCallback(async (content: string): Promise<Task | null> => {
    setLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Send failed");
      const data = await res.json();
      const msg: Message = {
        ...data.message,
        timestamp: new Date(data.message.timestamp),
        metadata: null,
      };
      setMessages((prev) => [
        ...prev,
        { message: msg, task: data.task ?? null, reminder: data.reminder ?? null },
      ]);
      return data.task ?? null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { messages, loading, fetchMessages, sendMessage };
}
