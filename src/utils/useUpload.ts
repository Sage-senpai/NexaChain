// FILE 3: src/utils/useUpload.ts (FIXED - Correct user access)
// ============================================================

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import useUser from "./useUser";

interface UploadOptions {
  file: File;
  bucket?: string;
}

interface UploadResult {
  url: string | null;
  error: string | null;
}

export default function useUpload(): [(options: UploadOptions) => Promise<UploadResult>, boolean] {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const { data: user } = useUser(); // ✅ Destructure 'data' from useUser

  const upload = async ({ file, bucket = "proof-images" }: UploadOptions): Promise<UploadResult> => {
    setLoading(true);

    try {
      if (!file) throw new Error("No file provided");
      if (!user?.id) throw new Error("User not authenticated"); // ✅ Now user is the User object

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) throw new Error("File size must be less than 5MB");

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Only JPG, PNG, and WebP images are allowed");
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to user folder
      const filePath = `${user.id}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL (better than signed URL for proof images)
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setLoading(false);
      return { url: urlData.publicUrl, error: null };
    } catch (err) {
      setLoading(false);
      return { url: null, error: err instanceof Error ? err.message : "Upload failed" };
    }
  };

  return [upload, loading];
}
