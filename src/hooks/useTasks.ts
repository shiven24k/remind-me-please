"use client";

import { useState, useCallback } from "react";
import type { Task } from "@/lib/schema";

export function useTasks(initial: Task[] = []) {
  const [tasks, setTasks] = useState<Task[]>(initial);

  const fetchTasks = useCallback(async () => {
    const res = await fetch("/api/tasks");
    if (!res.ok) return;
    const data = await res.json();
    setTasks(data.tasks as Task[]);
  }, []);

  const updateTask = useCallback(
    async (id: string, updates: Partial<Pick<Task, "status" | "priority" | "title">>) => {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t))
      );
    },
    []
  );

  const deleteTask = useCallback(async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addTask = useCallback((task: Task) => {
    setTasks((prev) => {
      if (prev.find((t) => t.id === task.id)) return prev;
      return [task, ...prev];
    });
  }, []);

  return { tasks, fetchTasks, updateTask, deleteTask, addTask };
}
