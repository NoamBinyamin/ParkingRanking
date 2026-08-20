"use client";

import { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export type PushSupportState = "unsupported" | "default" | "granted" | "denied";

export function usePushNotifications(userId: string | null | undefined) {
  const [state, setState] = useState<PushSupportState>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      setState("unsupported");
      return;
    }
    setState(Notification.permission as PushSupportState);

    navigator.serviceWorker
      .register("/sw.js")
      .then(async (registration) => {
        const sub = await registration.pushManager.getSubscription();
        setIsSubscribed(Boolean(sub));
      })
      .catch(() => {
        // Registration can fail (e.g. not served over HTTPS) -- treat as unsupported.
        setState("unsupported");
      });
  }, []);

  const subscribe = useCallback(async () => {
    if (!userId) return;
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not configured");
      return;
    }

    setIsBusy(true);
    try {
      const permission = await Notification.requestPermission();
      setState(permission as PushSupportState);
      if (permission !== "granted") return;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      const json = subscription.toJSON();
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: userId,
          endpoint: json.endpoint!,
          p256dh: json.keys!.p256dh!,
          auth: json.keys!.auth!,
        },
        { onConflict: "endpoint" }
      );
      if (error) throw error;
      setIsSubscribed(true);
    } catch (err) {
      console.error("Failed to subscribe to push notifications", err);
    } finally {
      setIsBusy(false);
    }
  }, [userId]);

  const unsubscribe = useCallback(async () => {
    setIsBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        const supabase = createSupabaseBrowserClient();
        await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
      }
      setIsSubscribed(false);
    } catch (err) {
      console.error("Failed to unsubscribe from push notifications", err);
    } finally {
      setIsBusy(false);
    }
  }, []);

  return { state, isSubscribed, isBusy, subscribe, unsubscribe };
}
