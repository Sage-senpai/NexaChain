// src/utils/useUpload.ts
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

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

  const upload = async ({ file, bucket = "proof-images" }: UploadOptions): Promise<UploadResult> => {
    setLoading(true);

    try {
      // Validate file
      if (!file) {
        throw new Error("No file provided");
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB");
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Only JPG, PNG, and WebP images are allowed");
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setLoading(false);
      return { url: publicUrl, error: null };
    } catch (err) {
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      return { url: null, error: errorMessage };
    }
  };

  return [upload, loading];
}