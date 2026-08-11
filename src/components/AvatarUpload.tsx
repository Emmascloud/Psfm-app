"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateAvatar } from "@/app/auth/actions";
import Avatar from "./Avatar";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export default function AvatarUpload({
  userId,
  name,
  currentUrl,
}: {
  userId: string;
  name: string;
  currentUrl: string | null;
}) {
  const [url, setUrl] = useState(currentUrl);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image is too large — please keep it under 5MB.");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("media").getPublicUrl(path);
    setUrl(data.publicUrl);
    startTransition(() => {
      updateAvatar(data.publicUrl);
    });
    setUploading(false);
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar url={url} name={name} size={64} />
      <div>
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="font-data text-xs rounded-full border border-paper-dim px-3 py-1.5 text-ink-on-paper hover:border-marigold transition-colors disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Change photo"}
        </button>
        {error && <p className="font-body text-xs text-ember mt-1">{error}</p>}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
    </div>
  );
}
