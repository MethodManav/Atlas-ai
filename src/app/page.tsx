"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";
import { MapPanel } from "@/components/MapPanel";

export default function Home() {
  const [chatOpen, setChatOpen] = useState(true);

  return (
    <main className="flex flex-row h-screen w-screen overflow-hidden bg-slate-950">
      {/* Left: Map Panel — fills all remaining space */}
      <div className="flex-1 min-w-0 relative h-full">
        <MapPanel />

        {/* Floating toggle button — glassmorphism pill at the right edge of the map */}
        <button
          onClick={() => setChatOpen((o) => !o)}
          aria-label={chatOpen ? "Collapse chat" : "Expand chat"}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 group"
        >
          <div
            className={`
              flex items-center justify-center w-8 h-14 rounded-l-2xl
              border border-r-0 transition-all duration-200
              shadow-xl shadow-slate-900/20
              atlas-glass
              hover:bg-blue-600 hover:border-blue-500/40 hover:text-white hover:shadow-blue-500/30
            `}
          >
            {chatOpen ? (
              <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            ) : (
              <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            )}
          </div>
        </button>
      </div>

      {/* Right: Chat Panel — collapses to w-0 with spring-like transition */}
      <div
        className={`flex-shrink-0 z-10 transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden
          ${chatOpen ? "w-[390px]" : "w-0"}
        `}
        style={{
          boxShadow: chatOpen ? "-12px 0 40px rgba(0,0,0,0.14)" : "none",
        }}
      >
        {/* Fixed-width inner wrapper prevents content from squashing during animation */}
        <div className="w-[390px] h-full flex flex-col">
          <ChatPanel />
        </div>
      </div>
    </main>
  );
}
