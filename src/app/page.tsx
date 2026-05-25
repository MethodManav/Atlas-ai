import { ChatPanel } from "@/components/ChatPanel";
import { MapPanel } from "@/components/MapPanel";

export default function Home() {
  return (
    <main className="flex flex-row h-screen w-screen overflow-hidden">
      {/* Left: Map Panel — fills remaining space */}
      <div className="flex-1 min-w-0 relative">
        <MapPanel />
      </div>

      {/* Right: Chat Panel — fixed width sidebar */}
      <div className="w-[380px] flex-shrink-0 flex flex-col border-l shadow-xl z-10">
        <ChatPanel />
      </div>
    </main>
  );
}
