import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      // The (app) routes are forced "dynamic" by the shared layout's
      // cookies()-based auth check, but their pages carry zero
      // server-fetched data (all data lives in the client-side SWR
      // cache instead, which revalidates on its own). So there's
      // nothing about the cached route *shell* that can go stale --
      // safe to let the Router Cache skip the server round-trip
      // entirely on repeat navigations instead of the ~0s default for
      // dynamic routes.
      dynamic: 3600,
    },
  },
};

export default nextConfig;
