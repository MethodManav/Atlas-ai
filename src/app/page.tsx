import { ChatPanel } from "@/components/ChatPanel";
import { MapPanel } from "@/components/MapPanel";

export default function Home() {
  return (
    <main className="flex h-full w-full overflow-hidden">
      {/* Left: Chat Panel */}
      <div className="w-[380px] flex-shrink-0 flex flex-col h-full border-r shadow-lg z-10">
        <ChatPanel />
      </div>

      {/* Right: Map Panel */}
      <div className="flex-1 h-full relative">
        <MapPanel />
      </div>
    </main>
  );
}
