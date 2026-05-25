"use client";

import { TamboProvider } from "@tambo-ai/react";
import { currentTimeContextHelper } from "@tambo-ai/react";
import { tamboComponents, tamboTools } from "@/lib/tambo";

export function Providers({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY || "";

  return (
    <TamboProvider
      apiKey={apiKey}
      components={tamboComponents}
      tools={tamboTools}
      contextHelpers={{
        currentTime: currentTimeContextHelper,
      }}
    >
      {children}
    </TamboProvider>
  );
}
