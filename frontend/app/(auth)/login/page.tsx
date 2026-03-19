"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await login({ email, password });
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", res.access_token);
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[hsl(var(--background))]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100]"
      >
        Skip to main content
      </a>
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-2">
          <Sparkles className="h-10 w-10 text-[hsl(var(--accent))]" />
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            AI Event Concierge
          </h1>
        </div>
        <Card className="border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <CardHeader>
            <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
              Welcome back
            </h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Sign in to your account
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  className="rounded-[var(--radius)] border border-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/10 p-3 text-sm text-[hsl(var(--destructive))]"
                  role="alert"
                >
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-[hsl(var(--foreground))]"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[hsl(var(--foreground))]"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
              <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
                No account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-[hsl(var(--primary))] hover:underline"
                >
                  Create one
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
