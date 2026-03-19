'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, Loader2 } from 'lucide-react';

interface QueryInputProps {
  onSubmit: (query: string) => Promise<void>;
  isLoading: boolean;
}

export function QueryInput({ onSubmit, isLoading }: QueryInputProps) {
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const count = query.length;
  const isOverLimit = count > 450;
  const isDisabled = count < 10 || count > 500 || isLoading || isSubmitting;

  const handleSubmit = async () => {
    if (isDisabled) return;
    setIsSubmitting(true);
    try {
      await onSubmit(query);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <Textarea
        placeholder="Describe your event... (e.g., 'We need a venue for 200 people in NYC for a tech conference in Q2')"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        maxLength={500}
        rows={4}
        className="resize-none"
      />
      <div className="flex items-center justify-between">
        <span className={`text-xs ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
          {count}/500
        </span>
        <Button
          onClick={handleSubmit}
          disabled={isDisabled}
          size="lg"
          className="gap-2"
        >
          {isLoading || isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Planning...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Generate Proposal
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
