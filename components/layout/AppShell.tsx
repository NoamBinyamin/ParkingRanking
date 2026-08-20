"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Profile } from "@/lib/types/database";
import { useProfile } from "@/lib/hooks/useProfile";
import { signOut } from "@/lib/services/auth";

const MotionLink = motion.create(Link);

const TABS = [
  { href: "/report", label: "חניה", icon: "🅿️" },
  { href: "/leaderboard", label: "דירוג", icon: "🏆" },
  { href: "/profile", label: "פרופיל", icon: "👤" },
];

export function AppShell({ profile: initialProfile, children }: { profile: Profile; children: ReactNode }) {
  // Shares the same SWR cache entry every screen reads/writes (optimistic
  // score bumps from Report, revalidation elsewhere), so the header stays
  // in sync with whatever the rest of the app just did.
  const { data: activeProfile = initialProfile } = useProfile(initialProfile.id, initialProfile);
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ paddingBottom: "calc(7rem + env(safe-area-inset-bottom))" }}
    >
      <header className="flex items-center justify-between px-5 py-4">
        <Link href="/profile" className="flex items-center gap-2">
          <span className="text-2xl">{activeProfile.avatar_emoji}</span>
          <div className="text-start">
            <p className="font-display text-sm font-semibold text-ink/70">
              {activeProfile.username}
            </p>
            <p className="font-display text-lg font-bold text-game-purple-dark">
              {activeProfile.total_score} נק&apos;
            </p>
          </div>
          {activeProfile.current_streak > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-game-yellow/20 px-2 py-1 font-display text-xs font-bold text-game-yellow-dark">
              🔥 {activeProfile.current_streak}
            </span>
          )}
        </Link>
        <button
          onClick={handleSignOut}
          className="text-sm font-semibold text-ink/40 hover:text-game-red-dark"
        >
          התנתקות
        </button>
      </header>

      <main className="flex-1 px-5">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-10 flex justify-center"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <div className="flex gap-2 rounded-full border-2 border-ink/10 bg-surface/90 p-2 shadow-lg backdrop-blur">
          {TABS.map((tab) => {
            const isActive = pathname?.startsWith(tab.href);
            return (
              <MotionLink
                key={tab.href}
                href={tab.href}
                whileTap={{ scale: 0.9 }}
                className={`flex items-center gap-2 rounded-full px-5 py-3 font-display text-sm font-semibold transition-colors ${
                  isActive ? "bg-game-purple text-white" : "text-ink/50"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </MotionLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
