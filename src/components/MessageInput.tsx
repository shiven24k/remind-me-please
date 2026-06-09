"use client";

import { useRef, useState, KeyboardEvent } from "react";
import { Send, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export default function MessageInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="bg-[#f0f0f0] dark:bg-[#1f2c34] px-3 py-2.5 flex items-end gap-2 border-t border-gray-200 dark:border-gray-700">
      <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-3xl px-4 py-2 flex items-end gap-2 shadow-sm">
        <Smile className="w-5 h-5 text-gray-400 mb-0.5 shrink-0" />
        <textarea
          ref={textareaRef}
          className={cn(
            "flex-1 bg-transparent resize-none text-sm outline-none",
            "text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500",
            "max-h-40 min-h-[24px] leading-6"
          )}
          placeholder="Message (e.g. 'remind me to call mom at 5pm')"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          rows={1}
          disabled={disabled}
        />
      </div>
      <button
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        className={cn(
          "w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors",
          "bg-[#128c7e] hover:bg-[#075e54] disabled:bg-gray-300 dark:disabled:bg-gray-600",
          "disabled:cursor-not-allowed text-white shadow-sm"
        )}
      >
        {disabled ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
