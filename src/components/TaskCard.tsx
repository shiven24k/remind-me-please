"use client";

import { format } from "date-fns";
import { Check, Trash2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/schema";

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

type Props = {
  task: Task;
  onUpdate: (updates: Partial<Pick<Task, "status" | "priority" | "title">>) => Promise<void>;
  onDelete: () => Promise<void>;
};

export default function TaskCard({ task, onUpdate, onDelete }: Props) {
  const isDone = task.status === "done";
  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && !isDone;

  return (
    <div
      className={cn(
        "rounded-xl border p-3 bg-white dark:bg-[#1f2c34] transition-opacity",
        "border-gray-200 dark:border-gray-700",
        isOverdue && "border-red-300 dark:border-red-800"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          onClick={() => onUpdate({ status: isDone ? "pending" : "done" })}
          className={cn(
            "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
            isDone
              ? "bg-[#25d366] border-[#25d366]"
              : "border-gray-400 hover:border-[#25d366]"
          )}
        >
          {isDone && <Check className="w-3 h-3 text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium text-gray-800 dark:text-gray-100",
              isDone && "line-through text-gray-400 dark:text-gray-500"
            )}
          >
            {task.title}
          </p>

          {task.dueDate && (
            <div
              className={cn(
                "flex items-center gap-1 mt-1",
                isOverdue
                  ? "text-red-500"
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              {isOverdue ? (
                <AlertCircle className="w-3 h-3" />
              ) : (
                <Clock className="w-3 h-3" />
              )}
              <span className="text-xs">
                {format(new Date(task.dueDate), "MMM d, h:mm a")}
              </span>
            </div>
          )}

          <span
            className={cn(
              "inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider",
              PRIORITY_STYLES[task.priority]
            )}
          >
            {task.priority}
          </span>
        </div>

        <button
          onClick={onDelete}
          className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0 mt-0.5"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
