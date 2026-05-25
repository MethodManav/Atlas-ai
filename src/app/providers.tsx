"use client";

import { TamboProvider } from "@tambo-ai/react";
import { tamboComponents, tamboTools, tamboSystemPrompt } from "@/lib/tambo";

export function Providers({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY || "";

  return (
    <TamboProvider
      apiKey={apiKey}
      components={tamboComponents}
      tools={tamboTools}
      customInstructions={tamboSystemPrompt}
    >
      {children}
    </TamboProvider>
  );
}
