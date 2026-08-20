"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { signInWithUsername, signUpWithUsername } from "@/lib/services/auth";

type Mode = "login" | "register";

// Hebrew, English, digits, spaces and underscores -- anything else (emoji,
// punctuation) is rejected to keep names looking like names.
const USERNAME_PATTERN = /^[a-zA-Z0-9_֐-׿ ]+$/;

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3) {
      setError("שם המשתמש צריך להיות באורך 3 תווים לפחות");
      return;
    }
    if (!USERNAME_PATTERN.test(trimmedUsername)) {
      setError("שם המשתמש יכול להכיל רק אותיות (עברית/אנגלית), מספרים, רווחים וקו תחתון");
      return;
    }
    if (password.length < 6) {
      setError("הסיסמה צריכה להיות באורך 6 תווים לפחות");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await signInWithUsername(trimmedUsername, password);
      } else {
        await signUpWithUsername(trimmedUsername, password);
      }
      router.push("/report");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "משהו השתבש");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-sm animate-pop-in">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-2 text-5xl animate-float">🅿️</div>
        <h1 className="font-display text-2xl font-bold text-ink">נקודות חניה</h1>
        <p className="text-sm text-ink/60">דווחו איפה חניתם. תרוויחו נקודות.</p>
      </div>

      <div className="mb-6 flex rounded-2xl bg-ink/5 p-1">
        {(["login", "register"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`flex-1 rounded-xl py-2 text-sm font-display font-semibold transition-colors ${
              mode === m ? "bg-white text-game-purple-dark shadow" : "text-ink/50"
            }`}
          >
            {m === "login" ? "התחברות" : "הרשמה"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-ink/70">שם משתמש</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="רוני_חניון"
            autoComplete="username"
            className="w-full rounded-2xl border-2 border-ink/10 px-4 py-3 outline-none focus:border-game-purple"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-ink/70">סיסמה</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            dir="ltr"
            className="w-full rounded-2xl border-2 border-ink/10 px-4 py-3 text-right outline-none focus:border-game-purple"
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl bg-game-red/10 px-3 py-2 text-sm font-semibold text-game-red-dark"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full">
          {mode === "login" ? "יאללה לחנות! 🚗" : "מצטרפים לכיף! 🎉"}
        </Button>
      </form>
    </Card>
  );
}
