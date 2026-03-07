import { supabase } from "@/lib/supabase";

const ADMIN_EMAILS = ["kaizensetup.ng@gmail.com"]; // 👈 replace with your actual admin email(s)

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!ADMIN_EMAILS.includes(data.user.email ?? "")) {
    await supabase.auth.signOut();
    throw new Error("Not authorised as admin.");
  }
  return data;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) return null;
  if (!ADMIN_EMAILS.includes(session.user.email ?? "")) return null;
  return session;
}