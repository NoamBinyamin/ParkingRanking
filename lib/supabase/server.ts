import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Wrapped in React's cache() so multiple calls within the same request
// (layout + page + any nested component) share one client instance and,
// more importantly, one auth check -- see getCurrentUser below.
export const createSupabaseServerClient = cache(async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render -- safe to ignore,
            // the middleware refreshes the session cookie on navigation.
          }
        },
      },
    }
  );
});

// auth.getUser() is a real network round-trip to Supabase (by design --
// it re-verifies the JWT rather than trusting the cookie). The layout and
// the page for a given route both need the current user, so without this
// cache() wrapper every navigation paid for that round-trip twice.
export const getCurrentUser = cache(async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
});
