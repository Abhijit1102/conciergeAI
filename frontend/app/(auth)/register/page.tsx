"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { register } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setIsSubmitting(true);
    try {
      await register({ username, email, password });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[hsl(var(--background))]">
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
              Create account
            </h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Get started with AI-powered event planning
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
                  htmlFor="username"
                  className="text-sm font-medium text-[hsl(var(--foreground))]"
                >
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={30}
                  className="w-full"
                />
              </div>
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
              <div className="space-y-2">
                <label
                  htmlFor="confirm"
                  className="text-sm font-medium text-[hsl(var(--foreground))]"
                >
                  Confirm Password
                </label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>
              <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-[hsl(var(--primary))] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
