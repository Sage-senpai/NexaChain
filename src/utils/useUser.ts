// FILE 2: src/utils/useUser.ts (UPDATED - Better return type)
// ============================================================

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface UseUserReturn {
  data: User | null;
  loading: boolean;
  error: Error | null;
  // Add convenience properties for easier access
  user: User | null;
  id: string | null;
  email: string | null;
}

export default function useUser(): UseUserReturn {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        if (mounted) {
          setData(user);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Failed to fetch user"));
          setLoading(false);
        }
      }
    };

    getUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setData(session?.user ?? null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { 
    data, 
    loading, 
    error,
    // Convenience properties
    user: data,
    id: data?.id ?? null,
    email: data?.email ?? null
  };
}