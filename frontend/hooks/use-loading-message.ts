'use client';

import { useState, useEffect } from 'react';

const MESSAGES = [
  "Searching curated venues...",
  "Analysing your budget...",
  "Matching location preferences...",
  "Almost ready...",
];

export function useLoadingMessage(isLoading: boolean): string {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading]);

  return MESSAGES[messageIndex];
}
