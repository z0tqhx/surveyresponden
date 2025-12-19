"use client";

import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import * as React from "react";

type Props = {
  children: React.ReactNode;
};

function createEmotionCache() {
  const cache = createCache({ key: "chakra" });
  cache.compat = true;
  return cache;
}

export function EmotionCacheProvider({ children }: Props) {
  const [{ cache, flush }] = React.useState(() => {
    const cache = createEmotionCache();
    cache.inserted = {};

    const prevInsert = cache.insert;
    let insertedKeys: string[] = [];

    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        insertedKeys.push(serialized.name);
      }
      return prevInsert(...args);
    };

    const flush = () => {
      const prev = insertedKeys;
      insertedKeys = [];
      return prev;
    };

    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) return null;

    let styles = "";
    for (const name of names) {
      styles += cache.inserted[name];
    }

    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
