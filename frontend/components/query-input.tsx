"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";

interface QueryInputProps {
  onSubmit: (query: string) => Promise<void>;
  isLoading: boolean;
}

export function QueryInput({ onSubmit, isLoading }: QueryInputProps) {
  const [query, setQuery] = useState("");
  const charCount = query.length;
  const valid = charCount >= 10 && charCount <= 500;

  return (
    <div className="space-y-3">
      <Textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Describe your event... e.g. "10-person leadership retreat in the mountains, 3 days, $4000 budget"'
        rows={4}
        maxLength={500}
        className="resize-none text-sm bg-[hsl(var(--secondary))] border-[hsl(var(--border))] focus-visible:ring-[hsl(var(--primary))] placeholder:text-[hsl(var(--muted-foreground))]"
      />
      <div className="flex items-center justify-between">
        <span
          className={`text-xs ${
            charCount > 450 ? "text-[hsl(var(--destructive))]" : "text-[hsl(var(--muted-foreground))]"
          }`}
        >
          {charCount}/500
        </span>
        <Button
          onClick={() => onSubmit(query)}
          disabled={!valid || isLoading}
          size="lg"
          className="gap-2 min-w-[160px]"
          aria-busy={isLoading}
          aria-label={isLoading ? "Planning..." : "Plan My Event"}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Planning...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" /> Plan My Event
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
