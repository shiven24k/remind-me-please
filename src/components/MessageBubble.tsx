import { format } from "date-fns";
import { CheckCheck, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message, Task } from "@/lib/schema";

type Props = {
  message: Message;
  task: Task | null;
};

export default function MessageBubble({ message, task }: Props) {
  const time = format(new Date(message.timestamp), "HH:mm");

  return (
    <div className="flex justify-end px-2">
      <div
        className={cn(
          "max-w-[75%] min-w-[80px] rounded-2xl rounded-tr-sm px-3 py-2 shadow-sm",
          "bg-[#dcf8c6] dark:bg-[#005c4b]"
        )}
      >
        <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </p>

        {task && (
          <div className="mt-2 flex items-center gap-1.5 bg-green-600/10 dark:bg-green-400/10 rounded-lg px-2 py-1 w-fit max-w-full">
            <Tag className="w-3 h-3 text-[#128c7e] dark:text-green-400 shrink-0" />
            <span className="text-xs text-[#128c7e] dark:text-green-400 font-medium truncate">
              Task: {task.title}
            </span>
          </div>
        )}

        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] text-gray-500 dark:text-gray-400">{time}</span>
          <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
        </div>
      </div>
    </div>
  );
}
