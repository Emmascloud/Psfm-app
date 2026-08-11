import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";
import AvatarUpload from "@/components/AvatarUpload";
import type { Profile, Contact } from "@/lib/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: contact }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user?.id ?? "").maybeSingle<Profile>(),
    supabase.from("contacts").select("*").eq("id", user?.id ?? "").maybeSingle<Contact>(),
  ]);

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10 max-w-md">
      <h1 className="font-display text-2xl text-cream mb-6">Your profile</h1>
      <div className="rounded-2xl bg-paper p-8">
        <p className="font-body text-sm text-ink-on-paper/60 mb-6">
          Only you can change this. Dates update instantly for the family;
          your phone number stays private to you and admins.
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
        <ProfileForm profile={profile ?? null} phone={contact?.phone ?? ""} />
      </div>
    </div>
  );
}
