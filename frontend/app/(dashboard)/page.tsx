'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AppHeader } from '@/components/app-header';
import { QueryInput } from '@/components/query-input';
import { VenueCard } from '@/components/venue-card';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { HistorySidebar } from '@/components/history-sidebar';
import { useConcierge } from '@/store/use-concierge';
import { useLoadingMessage } from '@/hooks/use-loading-message';
import { submitQuery, getHistory } from '@/lib/api';
import type { QueryResponse } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | undefined>();
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Check auth and load history on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Extract username from localStorage (would come from login response)
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername || undefined);

    // Load history
    (async () => {
      try {
        const historyData = await getHistory();
        setHistory(historyData.items);
      } catch (err) {
        // Silent failure - show empty state
        setHistory([]);
      } finally {
        setIsInitialized(true);
      }
    })();
  }, [router, setHistory]);

  const handleSubmitQuery = async (query: string) => {
    setLoading(true);
    setError(null);
    setCurrentResult(null);

    try {
      const response = await submitQuery({ query });
      setCurrentResult(response);
      prependHistory(response);
      setActiveHistoryId(response.id);
    } catch (err: any) {
      const errorMessage =
        err.response?.status === 502 || err.response?.status === 504
          ? 'AI could not respond. Please try again.'
          : err.message === 'Network Error'
          ? 'Connection error. Check your network.'
          : 'Failed to generate proposal. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    router.push('/login');
  };

  const handleSelectHistory = (item: QueryResponse) => {
    setCurrentResult(item);
    setActiveHistoryId(item.id);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader onLogout={handleLogout} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader username={username} onLogout={handleLogout} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column - Query and Results */}
          <div className="flex-1 space-y-6">
            <QueryInput onSubmit={handleSubmitQuery} isLoading={isLoading} />
            <div aria-live="polite" role="status">
              {isLoading && (
                <>
                  <LoadingSkeleton />
                  <p className="text-xs text-muted-foreground animate-pulse text-center mt-3">
                    {loadingMessage}
                  </p>
                </>
              )}
              {!isLoading && currentResult && (
                <VenueCard {...currentResult.proposal} />
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Separator for desktop */}
          <Separator orientation="vertical" className="hidden lg:block h-auto" />

          {/* Right column - History Sidebar (Desktop only) */}
          <aside className="w-full lg:w-80 hidden lg:block">
            <HistorySidebar
              history={history}
              activeHistoryId={activeHistoryId}
              onSelectItem={handleSelectHistory}
            />
          </aside>
        </div>

        {/* Mobile History - shown as flat list below on small screens */}
        {history.length > 0 && (
          <div className="lg:hidden mt-8 pt-8 border-t border-border">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Recent searches
            </h2>
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectHistory(item)}
                  className="p-4 rounded-lg border border-border cursor-pointer hover:border-primary/50 transition-all"
                >
                  <p className="text-xs text-muted-foreground truncate">{item.query}</p>
                  <p className="text-sm font-medium line-clamp-1 mt-1">
                    {item.proposal.venue_name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
