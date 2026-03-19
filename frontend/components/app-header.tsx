"use client";

import { Sparkles, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AppHeaderProps {
  onLogout?: () => void;
  onMenuClick?: () => void;
  user?: { username: string } | null;
}

export function AppHeader({ onLogout, onMenuClick, user }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60">
      <div className="flex h-14 items-center px-4 md:px-6 max-w-6xl mx-auto">
        <div className="flex flex-1 items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[hsl(var(--accent))]" />
            <span className="text-lg font-semibold text-[hsl(var(--foreground))]">
              AI Event Concierge
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <span className="text-sm text-[hsl(var(--muted-foreground))] hidden sm:inline">
              {user.username}
            </span>
          )}
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onMenuClick}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          {onLogout && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
          {!user && (
            <div className="flex gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
