// src/utils/useAdmin.ts
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface UseAdminReturn {
  isAdmin: boolean;
  loading: boolean;
}

export default function useAdmin(): UseAdminReturn {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const supabase = createClient();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check from JWT user_metadata
          const role = user.user_metadata?.role;
          setIsAdmin(role === "admin");
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          const role = session.user.user_metadata?.role;
          setIsAdmin(role === "admin");
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { isAdmin, loading };
}