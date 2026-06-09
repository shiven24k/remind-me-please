"use client";

import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

type PendingReminder = {
  reminder: { id: string; fireAt: string };
  task: { id: string; title: string; priority: string };
};

export function useReminders() {
  const permissionRequested = useRef(false);
  const firedIds = useRef(new Set<string>());

  const requestNotificationPermission = useCallback(async () => {
    if (permissionRequested.current) return;
    permissionRequested.current = true;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  const dismissReminder = useCallback(async (id: string) => {
    await fetch(`/api/reminders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "dismiss" }),
    });
  }, []);

  const snoozeReminder = useCallback(async (id: string, minutes: number) => {
    firedIds.current.delete(id);
    await fetch(`/api/reminders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "snooze", snoozeMinutes: minutes }),
    });
  }, []);

  const fireReminder = useCallback(
    async (item: PendingReminder) => {
      const { reminder, task } = item;
      if (firedIds.current.has(reminder.id)) return;
      firedIds.current.add(reminder.id);

      if (typeof window !== "undefined" && Notification.permission === "granted") {
        const notif = new Notification("remind-me-please", {
          body: task.title,
          icon: "/favicon.ico",
          tag: reminder.id,
          requireInteraction: task.priority === "high",
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      }

      toast(`⏰ ${task.title}`, {
        duration: task.priority === "high" ? Infinity : 10000,
        action: {
          label: "Snooze 10m",
          onClick: () => snoozeReminder(reminder.id, 10),
        },
        cancel: {
          label: "Dismiss",
          onClick: () => dismissReminder(reminder.id),
        },
      });

      await dismissReminder(reminder.id);
    },
    [dismissReminder, snoozeReminder]
  );

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/reminders?pending=true");
      if (!res.ok) return;
      const { reminders } = await res.json();
      for (const item of reminders as PendingReminder[]) {
        await fireReminder(item);
      }
    } catch {
      // silently ignore network errors during polling
    }
  }, [fireReminder]);

  useEffect(() => {
    requestNotificationPermission();
    poll();
    const interval = setInterval(poll, 30_000);
    return () => clearInterval(interval);
  }, [poll, requestNotificationPermission]);
}
