// FILE 4: src/utils/useUserFiles.ts (FIXED - Correct user access)
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import useUser from "./useUser";

interface FileObject {
  name: string;
  path: string;
  signedUrl: string;
}

export default function useUserFiles() {
  const { data: user, loading: userLoading } = useUser(); // ✅ Destructure 'data'
  const [files, setFiles] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Fetch user files
  const fetchFiles = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // List files in the user's folder
      const { data: listData, error: listError } = await supabase.storage
        .from("proof-images")
        .list(`${user.id}/`);

      if (listError) throw listError;

      // Generate signed URLs for each file
      const filesWithUrls: FileObject[] = await Promise.all(
        (listData ?? []).map(async (file) => {
          const { data: urlData, error: urlError } = await supabase.storage
            .from("proof-images")
            .createSignedUrl(`${user.id}/${file.name}`, 3600); // 1 hour validity
          
          if (urlError) throw urlError;
          
          return { 
            name: file.name, 
            path: `${user.id}/${file.name}`, 
            signedUrl: urlData.signedUrl 
          };
        })
      );

      setFiles(filesWithUrls);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch files");
    } finally {
      setLoading(false);
    }
  };

  // Delete a file
  const deleteFile = async (filePath: string) => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase.storage
        .from("proof-images")
        .remove([filePath]);

      if (deleteError) throw deleteError;

      // Remove from local state
      setFiles((prev) => prev.filter((f) => f.path !== filePath));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete file");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when user changes
  useEffect(() => {
    if (user?.id && !userLoading) {
      fetchFiles();
    }
  }, [user?.id, userLoading]);

  return { files, loading: loading || userLoading, error, fetchFiles, deleteFile };
}