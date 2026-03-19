"use client";

import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface HistoryCardProps {
  query: string;
  venueName: string;
  timestamp: string;
  isActive: boolean;
  onClick: () => void;
}

export function HistoryCard({
  query,
  venueName,
  timestamp,
  isActive,
  onClick,
}: HistoryCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all hover:border-[hsl(var(--primary))]/50 hover:shadow-md p-4 gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] ${
        isActive
          ? "border-[hsl(var(--primary))] ring-1 ring-[hsl(var(--primary))]"
          : "border-[hsl(var(--border))]"
      }`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
        {query}
      </p>
      <p className="text-sm font-medium text-[hsl(var(--foreground))] line-clamp-1">
        {venueName}
      </p>
      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
        {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
      </p>
    </Card>
  );
}
