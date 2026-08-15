import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PresentAvatar from "@/components/PresentAvatar";

export default async function ConnectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab === "following" ? "following" : "followers";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: followerRows }, { data: followingRows }] = await Promise.all([
    supabase.from("follows").select("follower_id").eq("following_id", user.id),
    supabase.from("follows").select("following_id").eq("follower_id", user.id),
  ]);

  const ids =
    activeTab === "followers"
      ? (followerRows ?? []).map((r) => r.follower_id)
      : (followingRows ?? []).map((r) => r.following_id);

  const { data: profiles } = ids.length
    ? await supabase.from("profiles").select("id, full_name, avatar_url").in("id", ids)
    : { data: [] as { id: string; full_name: string; avatar_url: string | null }[] };

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10 max-w-2xl">
      <h1 className="font-display text-2xl text-cream mb-1">Connections</h1>
      <p className="font-body text-sm text-sage mb-6">Who's following you, and who you follow.</p>

      <div className="flex gap-2 mb-6">
        <Link
          href="/dashboard/connections?tab=followers"
          className={`font-data text-sm rounded-full px-4 py-1.5 transition-colors ${
            activeTab === "followers" ? "bg-marigold text-ink-on-paper" : "bg-panel text-sage hover:text-cream"
          }`}
        >
          Followers ({followerRows?.length ?? 0})
        </Link>
        <Link
          href="/dashboard/connections?tab=following"
          className={`font-data text-sm rounded-full px-4 py-1.5 transition-colors ${
            activeTab === "following" ? "bg-marigold text-ink-on-paper" : "bg-panel text-sage hover:text-cream"
          }`}
        >
          Following ({followingRows?.length ?? 0})
        </Link>
      </div>

      {profiles && profiles.length > 0 ? (
        <div className="space-y-2">
          {profiles.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/members/${p.id}`}
              className="card-float flex items-center gap-3 rounded-xl bg-panel px-4 py-3 hover:bg-panel-raised transition-colors"
            >
              <PresentAvatar userId={p.id} url={p.avatar_url} name={p.full_name} size={40} />
              <p className="font-body text-cream">{p.full_name}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="font-body text-sage text-sm">
          {activeTab === "followers" ? "No one's followed you yet." : "You're not following anyone yet."}
        </p>
      )}
    </div>
  );
}
