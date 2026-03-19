"use client";

import { HistoryCard } from "./history-card";
import type { QueryResponse } from "@/types";

interface HistorySidebarProps {
  history: QueryResponse[];
  activeId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export function HistorySidebar({
  history,
  activeId,
  onSelect,
  isLoading,
}: HistorySidebarProps) {
  return (
    <aside className="w-full lg:w-80 space-y-4">
      <h2 className="text-lg font-medium text-[hsl(var(--foreground))]">
        Recent Searches
      </h2>
      <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        {isLoading ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Loading history...
          </p>
        ) : history.length === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            No searches yet. Plan your first event!
          </p>
        ) : (
          history.map((item) => (
            <HistoryCard
              key={item.id}
              query={item.query}
              venueName={item.proposal.venue_name}
              timestamp={item.timestamp}
              isActive={activeId === item.id}
              onClick={() => onSelect(item.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
