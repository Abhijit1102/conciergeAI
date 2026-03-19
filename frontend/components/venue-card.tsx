"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { VenueProposal } from "@/types";

interface VenueCardProps extends VenueProposal {}

export function VenueCard({
  venue_name,
  location,
  estimated_cost,
  why_it_fits,
}: VenueCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="border-[hsl(var(--ai-output-border))] bg-[hsl(var(--ai-output-bg))] shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
              {venue_name}
            </h2>
            <Sparkles className="h-5 w-5 text-[hsl(var(--accent))] shrink-0 mt-1" />
          </div>
          <div className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))] text-sm">
            <MapPin className="h-3.5 w-3.5" />
            <span>{location}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1.5 border">
            <DollarSign className="h-3 w-3" />
            {estimated_cost}
          </Badge>
          <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
            {why_it_fits}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
