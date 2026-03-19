"use client";

import { useCallback, useEffect } from "react";
import { QueryInput } from "@/components/query-input";
import { VenueCard } from "@/components/venue-card";
import { VenueCardSkeleton } from "@/components/loading-skeleton";
import { HistorySidebar } from "@/components/history-sidebar";
import { AppHeader } from "@/components/app-header";
import { useConcierge } from "@/store/use-concierge";
import { submitQuery, getHistory } from "@/lib/api";
import { useLoadingMessage } from "@/hooks/use-loading-message";

export default function DashboardPage() {
  const {
    currentResult,
    isLoading,
    error,
    history,
    activeHistoryId,
    setCurrentResult,
    setLoading,
    setError,
    setHistory,
    prependHistory,
    setActiveHistoryId,
  } = useConcierge();

  const loadingMessage = useLoadingMessage(isLoading);

  const handleSubmit = useCallback(
    async (query: string) => {
      setError(null);
      setLoading(true);
      try {
        const data = await submitQuery({ query });
        setCurrentResult(data);
        prependHistory(data);
        setActiveHistoryId(data.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [prependHistory, setActiveHistoryId, setCurrentResult, setError, setLoading]
  );

  const handleHistorySelect = useCallback(
    (id: string) => {
      const item = history.find((h) => h.id === id);
      if (item) {
        setCurrentResult(item);
        setActiveHistoryId(id);
      }
    },
    [history, setActiveHistoryId, setCurrentResult]
  );

  useEffect(() => {
    getHistory()
      .then((data) => setHistory(data.items))
      .catch(() => setHistory([]));
  }, [setHistory]);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[hsl(var(--primary))] focus:text-white focus:rounded-[var(--radius)]"
      >
        Skip to main content
      </a>
      <AppHeader user={{ username: "Demo" }} onLogout={() => {}} />
      <main
        id="main"
        className="max-w-6xl mx-auto px-4 py-8"
      >
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <QueryInput onSubmit={handleSubmit} isLoading={isLoading} />
            <div aria-live="polite" aria-busy={isLoading}>
              {error && (
                <div
                  className="rounded-[var(--radius)] border border-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/10 p-4 text-sm text-[hsl(var(--destructive))]"
                  role="alert"
                >
                  {error}
                </div>
              )}
              {isLoading && (
                <div className="space-y-2">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {loadingMessage}
                  </p>
                  <VenueCardSkeleton />
                </div>
              )}
              {!isLoading && currentResult && (
                <VenueCard {...currentResult.proposal} />
              )}
              {!isLoading && !currentResult && !error && (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Describe your event above and click &quot;Plan My Event&quot; to get AI-powered venue
                  recommendations.
                </p>
              )}
            </div>
          </div>
          <HistorySidebar
            history={history}
            activeId={activeHistoryId}
            onSelect={handleHistorySelect}
          />
        </div>
      </main>
    </div>
  );
}
