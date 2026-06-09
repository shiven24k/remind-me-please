"use client";

import { useEffect, useRef, useState } from "react";
import { useMessages } from "@/hooks/useMessages";
import { useTasks } from "@/hooks/useTasks";
import { useReminders } from "@/hooks/useReminders";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TaskSidebar from "./TaskSidebar";
import OllamaStatus from "./OllamaStatus";
import ThemeToggle from "./ThemeToggle";
import { ListTodo } from "lucide-react";
import type { Message, Task } from "@/lib/schema";

type Props = {
  initialMessages: Message[];
  initialTasks: Task[];
};

export default function ChatShell({ initialMessages, initialTasks }: Props) {
  const { messages, loading, sendMessage } = useMessages(initialMessages);
  const { tasks, fetchTasks, updateTask, deleteTask, addTask } = useTasks(initialTasks);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useReminders();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string) => {
    const extractedTask = await sendMessage(text);
    if (extractedTask) {
      addTask(extractedTask);
    } else {
      // Refresh in case server extracted something we missed
      fetchTasks();
    }
  };

  const pendingCount = tasks.filter((t) => t.status === "pending").length;

  return (
    <div className="flex h-screen overflow-hidden bg-[#e5ddd5] dark:bg-[#0d1117]">
      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#25d366] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              R
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">remind-me-please</p>
              <p className="text-[11px] text-green-200 leading-tight">
                Self-chat · tasks auto-extracted
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <OllamaStatus />
            <ThemeToggle />
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="flex items-center gap-1.5 text-sm bg-[#128c7e] hover:bg-[#075e54] px-3 py-1.5 rounded-lg transition-colors"
            >
              <ListTodo className="w-4 h-4" />
              <span className="hidden sm:inline">Tasks</span>
              {pendingCount > 0 && (
                <span className="bg-[#25d366] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto py-4 space-y-1.5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-20 h-20 rounded-full bg-[#25d366]/20 flex items-center justify-center mb-4">
                <span className="text-4xl">💬</span>
              </div>
              <h2 className="text-gray-600 dark:text-gray-300 font-semibold text-lg">
                Your self-chat
              </h2>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2 max-w-xs">
                Send yourself messages. Tasks and reminders are extracted automatically.
              </p>
              <div className="mt-4 text-xs text-gray-400 dark:text-gray-600 space-y-1">
                <p>Try: &quot;remind me to call mom at 5pm&quot;</p>
                <p>Or: &quot;buy groceries tomorrow morning&quot;</p>
                <p>Or: &quot;urgent: submit report by 9am Friday&quot;</p>
              </div>
            </div>
          )}

          {messages.map(({ message, task }) => (
            <MessageBubble key={message.id} message={message} task={task} />
          ))}
          <div ref={messagesEndRef} />
        </main>

        {/* Input */}
        <MessageInput onSend={handleSend} disabled={loading} />
      </div>

      {/* Task Sidebar */}
      {sidebarOpen && (
        <TaskSidebar
          tasks={tasks}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          onClose={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
