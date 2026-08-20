"use client";

import { useEffect, useState } from "react";
import { usePushNotifications } from "@/lib/hooks/usePushNotifications";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function detectNeedsHomeScreenInstall(): boolean {
  if (typeof window === "undefined") return false;
  const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  const nav = window.navigator as Navigator & { standalone?: boolean };
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
  return isIOS && !isStandalone;
}

export function PushNotificationSettings({ userId }: { userId: string }) {
  const { state, isSubscribed, isBusy, subscribe, unsubscribe } = usePushNotifications(userId);
  const [needsHomeScreenInstall, setNeedsHomeScreenInstall] = useState(false);

  useEffect(() => {
    setNeedsHomeScreenInstall(detectNeedsHomeScreenInstall());
  }, []);

  if (state === "unsupported") return null;

  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔔</span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold text-ink">התראות בזמן אמת</p>
          <p className="text-xs text-ink/50">
            {isSubscribed
              ? "תקבלו התראה כשמישהו מדווח על חניה חדשה, גם כשהאפליקציה סגורה"
              : "הפעילו כדי לקבל התראה גם כשהאפליקציה סגורה"}
          </p>
        </div>
      </div>

      {needsHomeScreenInstall ? (
        <p className="mt-3 rounded-xl bg-ink/5 p-3 text-xs leading-relaxed text-ink/60">
          כדי לקבל התראות באייפון, קודם הוסיפו את האפליקציה למסך הבית: לחצו על כפתור השיתוף בספארי, ואז &quot;הוספה
          למסך הבית&quot;.
        </p>
      ) : state === "denied" ? (
        <p className="mt-3 rounded-xl bg-ink/5 p-3 text-xs leading-relaxed text-ink/60">
          חסמתם התראות בעבר. כדי להפעיל מחדש, שנו את ההרשאה בהגדרות הדפדפן/מכשיר עבור האפליקציה.
        </p>
      ) : (
        <Button
          variant={isSubscribed ? "ghost" : "primary"}
          className="mt-3 w-full"
          isLoading={isBusy}
          onClick={isSubscribed ? unsubscribe : subscribe}
        >
          {isSubscribed ? "כבו התראות" : "הפעילו התראות 🔔"}
        </Button>
      )}
    </Card>
  );
}
