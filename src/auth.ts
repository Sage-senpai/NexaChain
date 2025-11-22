// src/auth.ts
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function auth() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    return {
      user: session?.user || null,
      session: session || null,
    };
  } catch (error) {
    console.error("Auth error:", error);
    return {
      user: null,
      session: null,
    };
  }
}

export async function getUser() {
  const { user } = await auth();
  return user;
}

export async function getSession() {
  const { session } = await auth();
  return session;
}

export async function isAuthenticated(): Promise<boolean> {
  const { user } = await auth();
  return !!user;
}

export async function requireAuth() {
  const { user } = await auth();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}