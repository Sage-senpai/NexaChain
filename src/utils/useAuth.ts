// src/utils/useAuth.ts
"use client";

import { signIn, signOut } from "next-auth/react";

interface SignInCredentials {
  email: string;
  password: string;
  callbackUrl?: string;
  redirect?: boolean;
}

interface SignUpCredentials extends SignInCredentials {
  name?: string;
}

interface SignOutOptions {
  callbackUrl?: string;
  redirect?: boolean;
}

export default function useAuth() {
  const signInWithCredentials = async ({
    email,
    password,
    callbackUrl = "/dashboard",
    redirect = true,
  }: SignInCredentials) => {
    const result = await signIn("credentials-signin", {
      email,
      password,
      redirect,
      callbackUrl,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    return result;
  };

  const signUpWithCredentials = async ({
    email,
    password,
    name,
    callbackUrl = "/onboarding",
    redirect = true,
  }: SignUpCredentials) => {
    const result = await signIn("credentials-signup", {
      email,
      password,
      name,
      redirect,
      callbackUrl,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    return result;
  };

  const handleSignOut = async ({
    callbackUrl = "/",
    redirect = true,
  }: SignOutOptions = {}) => {
    await signOut({ callbackUrl, redirect });
  };

  return {
    signInWithCredentials,
    signUpWithCredentials,
    signOut: handleSignOut,
  };
}