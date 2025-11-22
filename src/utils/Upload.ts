// src/app/api/utils/upload.ts
interface UploadOptions {
  url?: string;
  buffer?: Buffer;
  base64?: string;
}

interface UploadResult {
  url: string;
  mimeType: string | null;
}

async function upload({
  url,
  buffer,
  base64,
}: UploadOptions): Promise<UploadResult> {
  const response = await fetch(`https://api.createanything.com/v0/upload`, {
    method: "POST",
    headers: {
      "Content-Type": buffer ? "application/octet-stream" : "application/json",
    },
    body: buffer ? buffer : JSON.stringify({ base64, url }),
  });

  const data = await response.json();
  
  return {
    url: data.url,
    mimeType: data.mimeType || null,
  };
}

export { upload };
export default upload;