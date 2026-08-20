import { create } from "zustand";
import type { Profile } from "@/lib/types/database";

type UserState = {
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  addPoints: (points: number) => void;
};

/**
 * Client-side mirror of the signed-in user's profile. Hydrated once from
 * the server-fetched profile in AppShell, then updated optimistically so
 * the header score pill reacts instantly to a new report.
 */
export const useUserStore = create<UserState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  addPoints: (points) =>
    set((state) =>
      state.profile
        ? { profile: { ...state.profile, total_score: state.profile.total_score + points } }
        : state
    ),
}));
