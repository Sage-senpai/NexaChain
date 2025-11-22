// src/utils/useUpload.ts
"use client";

import upload from "@/app/api/utils/upload";

interface UploadOptions {
  file?: File;
  url?: string;
  base64?: string;
}

interface UploadResult {
  url?: string;
  error?: string;
  mimeType?: string | null;
}

type UseUploadReturn = [(options: UploadOptions) => Promise<UploadResult>];

export default function useUpload(): UseUploadReturn {
  const handleUpload = async (options: UploadOptions): Promise<UploadResult> => {
    try {
      if (options.file) {
        // Convert file to buffer
        const arrayBuffer = await options.file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const result = await upload({ buffer });
        return {
          url: result.url,
          mimeType: result.mimeType,
        };
      } else if (options.url) {
        const result = await upload({ url: options.url });
        return {
          url: result.url,
          mimeType: result.mimeType,
        };
      } else if (options.base64) {
        const result = await upload({ base64: options.base64 });
        return {
          url: result.url,
          mimeType: result.mimeType,
        };
      }

      return { error: "No file, URL, or base64 provided" };
    } catch (error) {
      console.error("Upload error:", error);
      return {
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  };

  return [handleUpload];
}