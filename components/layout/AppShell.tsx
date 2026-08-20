"use client";

import { useEffect, useRef, useState, type ReactNode, type TouchEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { Profile } from "@/lib/types/database";
import { useProfile } from "@/lib/hooks/useProfile";
import { useLiveReportFeed, type LiveReportEvent } from "@/lib/hooks/useLiveReportFeed";
import { LiveReportToast } from "@/components/layout/LiveReportToast";
import { signOut } from "@/lib/services/auth";

const LIVE_TOAST_DURATION_MS = 4000;

const MotionLink = motion.create(Link);

const TABS = [
  { href: "/report", label: "חניה", icon: "🅿️" },
  { href: "/leaderboard", label: "דירוג", icon: "🏆" },
  { href: "/profile", label: "פרופיל", icon: "👤" },
];

const SWIPE_THRESHOLD_PX = 60;

const slideVariants = {
  enter: (dir: number) => ({ x: dir >= 0 ? 56 : -56, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? -56 : 56, opacity: 0 }),
};

// A smooth "ease-out-expo"-style curve, plus enter/exit overlapping
// (mode="popLayout" below) instead of one finishing before the other
// starts -- reads as one continuous motion rather than two separate steps.
const slideTransition = { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const };

export function AppShell({ profile: initialProfile, children }: { profile: Profile; children: ReactNode }) {
  // Shares the same SWR cache entry every screen reads/writes (optimistic
  // score bumps from Report, revalidation elsewhere), so the header stays
  // in sync with whatever the rest of the app just did.
  const { data: activeProfile = initialProfile } = useProfile(initialProfile.id, initialProfile);
  const pathname = usePathname();
  const router = useRouter();
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);

  const currentIndex = TABS.findIndex((t) => pathname?.startsWith(t.href));

  // Direction is derived from tab order on every pathname change (whether
  // it came from a swipe or a tap on the nav bar), so both trigger the
  // same slide direction consistently.
  const prevIndexRef = useRef(currentIndex);
  const [direction, setDirection] = useState(0);
  useEffect(() => {
    if (currentIndex !== -1 && prevIndexRef.current !== -1 && prevIndexRef.current !== currentIndex) {
      setDirection(currentIndex > prevIndexRef.current ? 1 : -1);
    }
    prevIndexRef.current = currentIndex;
  }, [currentIndex]);

  // A screen scrolled down (e.g. Leaderboard/Profile) carrying that scroll
  // position into a swipe-triggered route change caused a layout jump
  // right as the fixed nav's pill was mid-animation, reading as the pill
  // "going crazy". Landing every navigation at the top avoids that, and
  // matches what switching tabs should feel like anyway.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  // A vertical scroll gesture can still register a touchend with enough
  // horizontal wobble to look like a swipe. Any real scroll event firing
  // between touchstart and touchend means this was a scroll, full stop --
  // more reliable than delta math alone. Scrolling happens inside `main`
  // now (it's the scroll container, not the window), so this listens there.
  const scrolledDuringTouch = useRef(false);
  useEffect(() => {
    const node = mainRef.current;
    if (!node) return;
    function onScroll() {
      scrolledDuringTouch.current = true;
    }
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => node.removeEventListener("scroll", onScroll);
  }, []);

  function handleTouchStart(e: TouchEvent) {
    scrolledDuringTouch.current = false;
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }

  function handleTouchEnd(e: TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || currentIndex === -1 || scrolledDuringTouch.current) return;

    const end = e.changedTouches[0];
    const deltaX = end.clientX - start.x;
    const deltaY = end.clientY - start.y;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX || Math.abs(deltaY) > Math.abs(deltaX)) return;

    // RTL-mirrored: swipe right -> next tab, swipe left -> previous tab
    // (the reverse of the LTR default, matching how RTL paging/carousel
    // gestures are conventionally mirrored).
    const target = deltaX > 0 ? TABS[currentIndex + 1] : TABS[currentIndex - 1];
    if (target) router.push(target.href);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  // Broadcasts a small "someone just reported X" toast to everyone else
  // currently in the app -- skips the reporter themselves (they already
  // get the full confirmation modal for their own report).
  const [liveToast, setLiveToast] = useState<{ id: number; event: LiveReportEvent } | null>(null);
  const toastIdRef = useRef(0);
  useLiveReportFeed(activeProfile.id, (event) => {
    toastIdRef.current += 1;
    setLiveToast({ id: toastIdRef.current, event });
  });
  useEffect(() => {
    if (!liveToast) return;
    const timeout = setTimeout(() => setLiveToast(null), LIVE_TOAST_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [liveToast]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <LiveReportToast toast={liveToast} />

      <header className="flex shrink-0 items-center justify-between px-5 py-3">
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

      <main
        ref={mainRef}
        className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain px-5"
        style={{ paddingBottom: "calc(7rem + env(safe-area-inset-bottom))" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={pathname}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="flex flex-1 flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

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
                className={`relative flex items-center gap-2 rounded-full px-5 py-3 font-display text-sm font-semibold transition-colors ${
                  isActive ? "text-white" : "text-ink/50"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full bg-game-purple"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10 text-lg">{tab.icon}</span>
                <span className="relative z-10">{tab.label}</span>
              </MotionLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
