'use client';

import { Button } from '@/components/ui/button';
import { Sparkles, LogOut } from 'lucide-react';

interface AppHeaderProps {
  username?: string;
  onLogout: () => void;
}

export function AppHeader({ username, onLogout }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="font-semibold text-lg">AI Event Concierge</h1>
        </div>
        <div className="flex items-center gap-3">
          {username && (
            <span className="text-sm text-muted-foreground">{username}</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
