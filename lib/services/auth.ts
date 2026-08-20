"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Supabase Auth requires an email. Since this app only collects a
// username + password, we synthesize a stable, unique email from the
// username. Remember to turn OFF "Confirm email" in your Supabase Auth
// settings, since these addresses can't receive a confirmation link.
const EMAIL_DOMAIN = "parkpoints.app";

const ASCII_USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function usernameToEmail(username: string): Promise<string> {
  const normalized = username.trim().toLowerCase();

  // Plain-ASCII usernames keep the original direct scheme, so accounts
  // created before Hebrew names were supported can still sign in.
  if (ASCII_USERNAME_PATTERN.test(normalized)) {
    return `${normalized}@${EMAIL_DOMAIN}`;
  }

  // Hebrew (or any other non-ASCII) usernames can't go directly into an
  // email's local part, so hash them into a stable, ASCII-safe address.
  const hash = await sha256Hex(normalized);
  return `u_${hash}@${EMAIL_DOMAIN}`;
}

export async function signUpWithUsername(username: string, password: string) {
  const supabase = createSupabaseBrowserClient();
  const email = await usernameToEmail(username);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username: username.trim() } },
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function signInWithUsername(username: string, password: string) {
  const supabase = createSupabaseBrowserClient();
  const email = await usernameToEmail(username);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error("שם משתמש או סיסמה שגויים");
  return data;
}

export async function signOut() {
  const supabase = createSupabaseBrowserClient();
  await supabase.auth.signOut();
}
