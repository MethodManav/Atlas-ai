"use client";

import { TamboProvider } from "@tambo-ai/react";
import { currentTimeContextHelper } from "@tambo-ai/react";
import { tamboComponents, tamboTools } from "@/lib/tambo";

/** Return a stable user key, persisted in localStorage so threads survive reloads. */
function getUserKey(): string {
  if (typeof window === "undefined") return "atlas-ssr";
  const stored = localStorage.getItem("atlas_user_key");
  if (stored) return stored;
  const key = `atlas-${crypto.randomUUID()}`;
  localStorage.setItem("atlas_user_key", key);
  return key;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY || "";

  return (
    <TamboProvider
      apiKey={apiKey}
      userKey={getUserKey()}
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
