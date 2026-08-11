"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { createPost } from "@/lib/posts/actions";

export default function PostForm({ profileId }: { profileId: string }) {
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image is too large — please keep it under 5MB.");
      return;
    }
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${profileId}/post-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("media").upload(path, file);
    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setUploading(false);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await createPost(profileId, body, imageUrl);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setBody("");
      setImageUrl(null);
    });
  }

  return (
    <div className="rounded-xl bg-panel p-4 mb-4">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share something on your timeline…"
        rows={3}
        className="w-full bg-transparent font-body text-cream placeholder:text-sage/60 outline-none resize-none"
      />
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="rounded-lg mt-2 max-h-48 object-cover" />
      )}
      {error && <p className="font-body text-xs text-ember mt-2">{error}</p>}
      <div className="flex items-center justify-between mt-3">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="font-data text-xs text-sage hover:text-cream transition-colors disabled:opacity-50"
        >
          {uploading ? "Uploading…" : imageUrl ? "Change photo" : "Add a photo"}
        </button>
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
        <button
          type="button"
          disabled={pending || uploading || !body.trim()}
          onClick={submit}
          className="rounded-full bg-marigold px-4 py-1.5 font-data text-xs font-medium text-ink-on-paper hover:bg-marigold-soft transition-colors disabled:opacity-50"
        >
          {pending ? "Posting…" : "Post"}
        </button>
      </div>
    </div>
  );
}
