'use client';

import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock } from 'lucide-react';
import { HistoryCard } from './history-card';
import type { QueryResponse } from '@/types';

interface HistorySidebarProps {
  history: QueryResponse[];
  activeHistoryId: string | null;
  onSelectItem: (item: QueryResponse) => void;
}

const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y:  0, transition: { duration: 0.3 } },
};

export function HistorySidebar({
  history,
  activeHistoryId,
  onSelectItem,
}: HistorySidebarProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Recent searches
      </h2>
      <ScrollArea className="h-[calc(100vh-220px)]">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Clock className="w-8 h-8 text-muted-foreground/40 mb-2" />
            <p className="text-muted-foreground text-sm">No searches yet</p>
          </div>
        ) : (
          <motion.ul
            className="space-y-2 pr-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {history.map((item) => (
              <motion.li key={item.id} variants={fadeUp}>
                <HistoryCard
                  query={item.query}
                  venueName={item.proposal.venue_name}
                  timestamp={item.timestamp}
                  isActive={activeHistoryId === item.id}
                  onClick={() => onSelectItem(item)}
                />
              </motion.li>
            ))}
          </motion.ul>
        )}
      </ScrollArea>
    </div>
  );
}
