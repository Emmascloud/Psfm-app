import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";
import HomeLink from "@/components/HomeLink";
import AvatarUpload from "@/components/AvatarUpload";
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
        <div className="flex items-center justify-between mb-6">
          <HomeLink />
          <Link href="/dashboard" className="font-data text-sm text-sage hover:text-cream transition-colors">
            Dashboard →
          </Link>
        </div>
        <Link href="/dashboard" className="font-display text-lg text-cream block mb-10 text-center">
          PSFM <span className="text-marigold">Family</span>
        </Link>
        <div className="rounded-2xl bg-paper p-8">
          <h1 className="font-display text-2xl text-ink-on-paper mb-1">Your dates</h1>
          <p className="font-body text-sm text-ink-on-paper/60 mb-6">
            Only you can change this. It updates instantly for the family.
          </p>
          {user && (
            <div className="mb-6 pb-6 border-b border-paper-dim">
              <AvatarUpload
                userId={user.id}
                name={profile?.full_name ?? "You"}
                currentUrl={profile?.avatar_url ?? null}
              />
            </div>
          )}
          <ProfileForm profile={profile ?? null} />
        </div>
      </div>
    </main>
  );
}
