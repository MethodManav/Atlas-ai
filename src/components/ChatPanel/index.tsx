"use client";

import { useRef, useEffect } from "react";
import { useTambo, useTamboThreadInput } from "@tambo-ai/react";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { BookingDrawer } from "@/components/BookingDrawer";

const SUGGESTIONS = [
  "Find hotels in Paris for 2 nights",
  "Show me 5-star hotels in Dubai under $500",
  "Budget hotels in Tokyo next weekend",
  "Beachfront hotels in Barcelona",
];

export function ChatPanel() {
  const { thread } = useTambo();
  const { value, setValue, submit, isPending } = useTamboThreadInput();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const messages = thread?.messages ?? [];

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!value.trim() || isPending) return;
    submit();
  }

  function handleSuggestion(text: string) {
    setValue(text);
    setTimeout(() => {
      submit();
    }, 50);
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white dark:bg-slate-900">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-sm leading-tight">Atlas AI</h1>
          <p className="text-xs text-muted-foreground">Hotel Concierge</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-600 font-medium">Online</span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-3 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-6 py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h2 className="font-bold text-base">Welcome to Atlas AI</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-[220px]">
                Your personal hotel concierge. Search, compare, and book hotels
                through conversation.
              </p>
            </div>
            <div className="w-full space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Try asking
              </p>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="w-full text-left text-xs bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 border hover:border-blue-300 rounded-lg px-3 py-2.5 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    isUser ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <Avatar className="w-7 h-7 flex-shrink-0 mt-0.5">
                    <AvatarFallback
                      className={cn(
                        "text-xs",
                        isUser
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={cn(
                      "flex flex-col gap-1.5 max-w-[85%]",
                      isUser ? "items-end" : "items-start"
                    )}
                  >
                    {/* Text content */}
                    {message.content && (
                      <div
                        className={cn(
                          "rounded-2xl px-3 py-2 text-sm leading-relaxed",
                          isUser
                            ? "bg-blue-600 text-white rounded-tr-sm"
                            : "bg-slate-100 dark:bg-slate-800 text-foreground rounded-tl-sm"
                        )}
                      >
                        {typeof message.content === "string"
                          ? message.content
                          : Array.isArray(message.content)
                          ? message.content
                              .filter((c: {type: string}) => c.type === "text")
                              .map((c: {type: string; text?: string}) => c.text)
                              .join("")
                          : null}
                      </div>
                    )}

                    {/* Rendered UI components (hotel cards, booking form, etc.) */}
                    {message.renderedComponent && (
                      <div className="w-full">
                        {message.renderedComponent}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isPending && (
              <div className="flex gap-2">
                <Avatar className="w-7 h-7 flex-shrink-0">
                  <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm px-3 py-2.5">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t bg-white dark:bg-slate-900">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search hotels, ask questions..."
            disabled={isPending}
            className="flex-1 h-9 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            type="submit"
            disabled={!value.trim() || isPending}
            size="sm"
            className="h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-1.5">
          Powered by Atlas AI · Tambo
        </p>
      </div>

      {/* Booking drawer (slides up from bottom of chat) */}
      <BookingDrawer />
    </div>
  );
}
