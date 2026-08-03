import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";
import type { Profile } from "@/lib/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id ?? "")
    .maybeSingle<Profile>();

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link href="/dashboard" className="font-display text-lg text-cream block mb-10 text-center">
          PSFM <span className="text-marigold">Circle</span>
        </Link>
        <div className="rounded-2xl bg-paper p-8">
          <h1 className="font-display text-2xl text-ink-on-paper mb-1">Your dates</h1>
          <p className="font-body text-sm text-ink-on-paper/60 mb-6">
            Only you can change this. It updates instantly for the circle.
          </p>
          <ProfileForm profile={profile ?? null} />
        </div>
      </div>
    </main>
  );
}
