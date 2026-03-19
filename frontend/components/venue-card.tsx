'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MapPin, DollarSign } from 'lucide-react';
import type { VenueProposal } from '@/types';

export function VenueCard(props: VenueProposal) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="border-[hsl(var(--ai-output-border))] bg-[hsl(var(--ai-output-bg))] shadow-xl">
        <CardHeader className="pb-3 flex flex-row items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{props.venue_name}</h2>
            <div className="flex items-center gap-1.5 mt-2 text-muted-foreground text-sm">
              <MapPin className="w-4 h-4" />
              {props.location}
            </div>
          </div>
          <Sparkles className="w-6 h-6 text-accent flex-shrink-0" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            {props.estimated_cost}
          </Badge>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {props.why_it_fits}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
