// src/utils/useUser.ts
"use client";

import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface UseUserReturn {
  data: User | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

async function fetchUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/token");
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export default function useUser(): UseUserReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  return {
    data: data || null,
    loading: isLoading,
    error: error as Error | null,
    refetch,
  };
}