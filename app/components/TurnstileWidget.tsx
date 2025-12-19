"use client";

import { Box, Text } from "@chakra-ui/react";
import * as React from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          "timeout-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

type Props = {
  siteKey: string;
  onToken: (token: string) => void;
  onError?: () => void;
};

let scriptPromise: Promise<void> | null = null;

function ensureScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(
      'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Turnstile")));
      return;
    }

    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Turnstile"));
    document.head.appendChild(s);
  });

  return scriptPromise;
}

export function TurnstileWidget({ siteKey, onToken, onError }: Props) {
  const elRef = React.useRef<HTMLDivElement | null>(null);
  const widgetIdRef = React.useRef<string | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function mount() {
      try {
        await ensureScript();
        if (cancelled) return;
        if (!elRef.current) return;
        if (!window.turnstile) throw new Error("Turnstile not available");

        if (widgetIdRef.current) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }

        widgetIdRef.current = window.turnstile.render(elRef.current, {
          sitekey: siteKey,
          callback: (token) => onToken(token),
          "error-callback": () => {
            onError?.();
          },
          "expired-callback": () => {
            onToken("");
          },
          "timeout-callback": () => {
            onToken("");
          },
          theme: "auto",
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load Turnstile";
        setLoadError(msg);
        onError?.();
      }
    }

    mount();

    return () => {
      cancelled = true;
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onError, onToken, siteKey]);

  if (loadError) {
    return (
      <Box borderWidth="1px" borderRadius="md" p={3} bg="red.50" borderColor="red.200">
        <Text fontSize="sm" color="red.700">
          Turnstile gagal dimuat. {loadError}
        </Text>
      </Box>
    );
  }

  return <Box ref={elRef} />;
}
