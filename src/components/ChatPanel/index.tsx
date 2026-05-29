"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useTambo, useTamboThreadInput } from "@tambo-ai/react";
import type { ReactTamboThreadMessage } from "@tambo-ai/react";
import { Send, Sparkles, Bot, User, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import { BookingTicket } from "@/components/BookingTicket";
import { useAtlasStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { BookingDrawer } from "@/components/BookingDrawer";

const SUGGESTIONS = [
  "Find hotels in Paris for 2 nights",
  "Show me 5-star hotels in Dubai under $500",
  "Budget hotels in Tokyo next weekend",
  "Beachfront hotels in Barcelona",
];

export function ChatPanel() {
  const { messages, startNewThread } = useTambo();
  const { bookingConfirmation, setBookingConfirmation } = useAtlasStore();
  const { value, setValue, submit, isPending } = useTamboThreadInput();
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingSuggestion, setPendingSuggestion] = useState<string | null>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Fire submit once the suggestion value has been committed to state
  useEffect(() => {
    if (pendingSuggestion === null) return;
    if (value !== pendingSuggestion) return;
    setPendingSuggestion(null);
    submit().catch(handleSubmitError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, pendingSuggestion]);

  const handleSubmitError = useCallback(
    (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("invalid_previous_run")) {
        console.warn("[Atlas] previousRunId mismatch — resetting to new thread");
        startNewThread();
      } else {
        console.error("[Atlas] submit error:", err);
      }
    },
    [startNewThread],
  );

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!value.trim() || isPending) return;
    submit().catch(handleSubmitError);
  }

  function handleSuggestion(text: string) {
    setValue(text);
    setPendingSuggestion(text);
  }

  return (
    <div className="flex flex-col h-full atlas-mesh-bg atlas-noise overflow-hidden">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3.5 relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 shadow-lg">
        {/* Subtle noise layer on header */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Logo mark */}
        <div className="relative w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 ring-1 ring-white/25 shadow-inner">
          <Sparkles className="w-5 h-5 text-white" />
        </div>

        <div className="relative">
          <h1 className="font-bold text-sm leading-tight text-white tracking-tight">
            Atlas AI
          </h1>
          <p className="text-xs text-blue-200 font-medium">Hotel Concierge</p>
        </div>

        {/* Online badge */}
        <div className="relative ml-auto flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 ring-1 ring-white/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
          <span className="text-xs text-white/90 font-semibold">Online</span>
        </div>
      </div>

      {/* ── Messages ──────────────────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 atlas-scrollbar">
        {messages.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center gap-5 py-10 text-center animate-atlas-fade-in">
            {/* Floating icon */}
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-400/30 animate-atlas-float">
                <Compass className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-amber-400 flex items-center justify-center shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div>
              <h2 className="font-bold text-base text-slate-800 tracking-tight">
                Welcome to Atlas AI
              </h2>
              <p className="text-sm text-slate-500 mt-1.5 max-w-[210px] leading-relaxed">
                Your personal concierge for hotels worldwide. Search, compare,
                and book through conversation.
              </p>
            </div>

            <div className="w-full space-y-2">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-3">
                Try asking
              </p>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="w-full text-left text-xs bg-white/80 backdrop-blur-sm hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 rounded-2xl px-4 py-3 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 group animate-atlas-scale-in"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <span className="text-slate-600 group-hover:text-blue-700 font-medium transition-colors">
                    {s}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-2">
            {messages.map((message: ReactTamboThreadMessage) => {
              const isUser = message.role === "user";

              const textContent = message.content
                .filter((c) => c.type === "text")
                .map((c) => ("text" in c ? c.text : ""))
                .join("");

              const componentBlocks = message.content.filter(
                (c) => c.type === "component",
              );

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2 chat-message-enter",
                    isUser ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  {/* Avatar */}
                  <Avatar className="w-7 h-7 flex-shrink-0 mt-0.5 ring-2 ring-white shadow-sm">
                    <AvatarFallback
                      className={cn(
                        "text-xs",
                        isUser
                          ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white"
                          : "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600",
                      )}
                    >
                      {isUser ? (
                        <User className="w-3.5 h-3.5" />
                      ) : (
                        <Bot className="w-3.5 h-3.5" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={cn(
                      "flex flex-col gap-2 max-w-[88%]",
                      isUser ? "items-end" : "items-start",
                    )}
                  >
                    {/* Text bubble */}
                    {textContent && (
                      <div
                        className={cn(
                          "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                          isUser
                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm shadow-blue-200"
                            : "bg-white text-slate-800 rounded-tl-sm border border-slate-100/80",
                        )}
                      >
                        {isUser ? (
                          textContent
                        ) : (
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => (
                                <p className="mb-1.5 last:mb-0">{children}</p>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold text-slate-900">{children}</strong>
                              ),
                              em: ({ children }) => (
                                <em className="italic text-slate-600">{children}</em>
                              ),
                              ul: ({ children }) => (
                                <ul className="mt-1 mb-1.5 space-y-0.5 pl-3">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="mt-1 mb-1.5 space-y-0.5 pl-4 list-decimal">{children}</ol>
                              ),
                              li: ({ children }) => (
                                <li className="flex gap-1.5 items-start">
                                  <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
                                  <span>{children}</span>
                                </li>
                              ),
                              h1: ({ children }) => (
                                <h1 className="font-bold text-base text-slate-900 mb-1">{children}</h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="font-semibold text-sm text-slate-900 mb-1">{children}</h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="font-semibold text-sm text-slate-800 mb-0.5">{children}</h3>
                              ),
                              code: ({ children }) => (
                                <code className="bg-slate-100 text-blue-700 px-1 py-0.5 rounded text-xs font-mono">
                                  {children}
                                </code>
                              ),
                              a: ({ href, children }) => (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline underline-offset-2 hover:text-blue-800"
                                >
                                  {children}
                                </a>
                              ),
                            }}
                          >
                            {textContent}
                          </ReactMarkdown>
                        )}
                      </div>
                    )}

                    {/* Rendered Tambo UI components */}
                    {componentBlocks.map((block, i) => {
                      if (
                        "renderedComponent" in block &&
                        block.renderedComponent
                      ) {
                        return (
                          <div key={i} className="w-full animate-atlas-scale-in">
                            {block.renderedComponent}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isPending && (
              <div className="flex gap-2 chat-message-enter">
                <Avatar className="w-7 h-7 flex-shrink-0 ring-2 ring-white shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 text-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-slate-100/80">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:140ms]" />
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:280ms]" />
                  </div>
                </div>
              </div>
            )}

            {/* Booking ticket — shown in chat after payment completes */}
            {bookingConfirmation && (
              <div className="flex gap-2 chat-message-enter">
                <Avatar className="w-7 h-7 flex-shrink-0 mt-0.5 ring-2 ring-white shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 text-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2 items-start">
                  <div className="bg-white rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm shadow-sm border border-slate-100/80 text-slate-700">
                    🎉 Your booking is confirmed! Here&apos;s your ticket:
                  </div>
                  <BookingTicket
                    {...bookingConfirmation}
                    onDismiss={() => setBookingConfirmation(null)}
                  />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input ─────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-3 pt-3 pb-4 border-t border-slate-200/70 bg-white/90 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Search hotels, ask anything…"
              disabled={isPending}
              className={cn(
                "w-full h-11 rounded-2xl px-4 text-sm bg-slate-50 border border-slate-200",
                "placeholder-slate-400 text-slate-800",
                "focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400",
                "disabled:opacity-50 transition-all duration-200",
                "shadow-sm",
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>
          <Button
            type="submit"
            disabled={!value.trim() || isPending}
            size="sm"
            className={cn(
              "h-11 w-11 p-0 rounded-2xl flex-shrink-0",
              "bg-gradient-to-br from-blue-600 to-indigo-600",
              "hover:from-blue-700 hover:to-indigo-700",
              "shadow-md hover:shadow-blue-400/40",
              "disabled:opacity-40 disabled:shadow-none",
              "transition-all duration-200 atlas-btn-shine",
            )}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-[10px] text-slate-400 text-center mt-2 font-medium tracking-wide">
          Powered by{" "}
          <span className="text-blue-500 font-semibold">Atlas AI</span> ·
          Tambo
        </p>
      </div>

      {/* Booking drawer */}
      <BookingDrawer />
    </div>
  );
}
