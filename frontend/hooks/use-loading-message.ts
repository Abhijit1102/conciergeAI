"use client";

import { useState, useEffect } from "react";

const MESSAGES = [
  "Searching curated venues...",
  "Analysing your budget...",
  "Matching location preferences...",
  "Almost ready...",
];

export function useLoadingMessage(isLoading: boolean) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setIdx(0);
      return;
    }
    const t = setInterval(
      () => setIdx((i) => (i + 1) % MESSAGES.length),
      2000
    );
    return () => clearInterval(t);
  }, [isLoading]);

  return MESSAGES[idx];
}
