'use client';

import { AppHeader } from '@/components/app-header';
import { HistorySidebar } from '@/components/history-sidebar';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { QueryInput } from '@/components/query-input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { VenueCard } from '@/components/venue-card';
import { useLoadingMessage } from '@/hooks/use-loading-message';
import { useConcierge } from '@/store/use-concierge';
import type { QueryResponse } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL;

/**
 * 🔥 Normalize API response shape
 */
const normalize = (data: any): QueryResponse => ({
  ...data,
  id: data.id,
  proposal: data.proposal ?? data.venue_proposal,
});

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

  // ── Auth check + load history ────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    setUsername(localStorage.getItem('username') ?? undefined);

    (async () => {
      try {
        const res = await fetch(`${API}/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          router.push('/login');
          return;
        }

        const data = await res.json();

        const normalizedHistory = (data.items ?? []).map((item: any) => {
          if (!item.id) {
            console.warn('History item missing id:', item);
          }
          return normalize(item);
        });

        setHistory(res.ok ? normalizedHistory : []);
      } catch {
        setHistory([]);
      } finally {
        setIsInitialized(true);
      }
    })();
  }, [router, setHistory]);

  // ── Submit query ─────────────────────────────────────────────────────────────
  const handleSubmitQuery = async (query: string) => {
    setLoading(true);
    setError(null);
    setCurrentResult(null);

    try {
      const token = localStorage.getItem('access_token');

      const res = await fetch(`${API}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message =
          res.status === 502 || res.status === 504
            ? 'AI could not respond. Please try again.'
            : res.status === 401
              ? 'Session expired. Please log in again.'
              : data.detail ?? 'Failed to generate proposal. Please try again.';

        setError(message);

        if (res.status === 401) router.push('/login');
        return;
      }

      const response = normalize(data);

      setCurrentResult(response);
      prependHistory(response);
      setActiveHistoryId(response.id);
    } catch {
      setError('Connection error. Check your network.');
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
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

          {/* Left column */}
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

              {!isLoading && currentResult && currentResult.proposal && (
                <VenueCard {...currentResult.proposal} />
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <Separator orientation="vertical" className="hidden lg:block h-auto" />

          {/* Right column - History */}
          <aside className="w-full lg:w-80 hidden lg:block">
            <HistorySidebar
              history={history}
              activeHistoryId={activeHistoryId}
              onSelectItem={handleSelectHistory}
            />
          </aside>
        </div>

        {/* Mobile history */}
        {history.length > 0 && (
          <div className="lg:hidden mt-8 pt-8 border-t border-border">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Recent searches
            </h2>

            <div className="space-y-2">
              {history.map((item, index) => (
                <div
                  key={item.id ?? `history-item-${index}`}
                  onClick={() => handleSelectHistory(item)}
                  className="p-4 rounded-lg border border-border cursor-pointer hover:border-primary/50 transition-all"
                >
                  <p className="text-xs text-muted-foreground truncate">
                    {item.query}
                  </p>

                  <p className="text-sm font-medium line-clamp-1 mt-1">
                    {item.proposal?.venue_name ?? 'No venue'}
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
