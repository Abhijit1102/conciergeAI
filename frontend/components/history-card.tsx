'use client';

import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/card';

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
      className={`cursor-pointer transition-all hover:border-primary/50 hover:shadow-md p-4 ${
        isActive ? 'border-primary ring-1 ring-primary' : ''
      }`}
    >
      <p className="text-xs text-muted-foreground truncate">{query}</p>
      <p className="text-sm font-medium line-clamp-1 mt-1">{venueName}</p>
      <p className="text-xs text-muted-foreground mt-2">
        {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
      </p>
    </Card>
  );
}
