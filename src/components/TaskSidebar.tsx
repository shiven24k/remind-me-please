"use client";

import { X, ListTodo } from "lucide-react";
import TaskCard from "./TaskCard";
import type { Task } from "@/lib/schema";

type Props = {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Pick<Task, "status" | "priority" | "title">>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onClose: () => void;
};

export default function TaskSidebar({ tasks, onUpdateTask, onDeleteTask, onClose }: Props) {
  const pending = tasks.filter((t) => t.status === "pending");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <aside className="w-80 shrink-0 bg-[#f7f7f7] dark:bg-[#111b21] border-l border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="bg-[#075e54] text-white px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo className="w-5 h-5" />
          <h2 className="font-semibold">Tasks & Reminders</h2>
        </div>
        <button onClick={onClose} className="hover:text-gray-300 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {pending.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
              Pending · {pending.length}
            </h3>
            <div className="space-y-2">
              {pending.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={(updates) => onUpdateTask(task.id, updates)}
                  onDelete={() => onDeleteTask(task.id)}
                />
              ))}
            </div>
          </section>
        )}

        {done.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
              Completed · {done.length}
            </h3>
            <div className="space-y-2 opacity-55">
              {done.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={(updates) => onUpdateTask(task.id, updates)}
                  onDelete={() => onDeleteTask(task.id)}
                />
              ))}
            </div>
          </section>
        )}

        {tasks.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-16 px-4">
            <ListTodo className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No tasks yet</p>
            <p className="mt-1 text-xs opacity-70">
              Try: &quot;remind me to buy groceries tomorrow&quot;
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
