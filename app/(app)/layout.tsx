import { redirect } from "next/navigation";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase/server";
import { getMyProfile } from "@/lib/services/profile";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createSupabaseServerClient();
  const profile = await getMyProfile(supabase, user.id);

  return <AppShell profile={profile}>{children}</AppShell>;
}
