import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// Signed URL for the member's private photo; refreshed whenever the stored URI changes.
export function useAvatarUrl(avatarUri) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!avatarUri) {
      setUrl(null);
      return;
    }
    let active = true;
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: avatarUri, expires_in: 86400 })
      .then((result) => active && setUrl(result?.signed_url || null))
      .catch(() => active && setUrl(null));
    return () => {
      active = false;
    };
  }, [avatarUri]);

  return url;
}