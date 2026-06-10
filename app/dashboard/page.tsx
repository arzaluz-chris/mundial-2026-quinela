import { redirect } from "next/navigation";
import { MatchCard } from "@/components/match-card";
import { SignOutButton } from "@/components/sign-out-button";
import { createClient } from "@/lib/supabase/server";
import { displayName } from "@/lib/format";
import type { LeaderboardRow, Match, Prediction, Profile } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [{ data: profile }, { data: matches }, { data: predictions }, { data: leaderboard }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
      supabase.from("matches").select("*").order("kickoff_at").limit(12).returns<Match[]>(),
      supabase.from("predictions").select("*").eq("user_id", user.id).returns<Prediction[]>(),
      supabase
        .from("leaderboard")
        .select("*, profiles(display_name,email)")
        .order("total_points", { ascending: false })
        .order("exact_predictions", { ascending: false })
        .limit(5)
        .returns<LeaderboardRow[]>()
    ]);

  const predictionByMatch = new Map((predictions || []).map((item) => [item.match_id, item]));

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-pitch">
            Mundial FIFA 2026
          </p>
          <h1 className="mt-1 text-3xl font-bold">
            Hola, {profile ? displayName(profile) : user.email}
          </h1>
        </div>
        <SignOutButton />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div>
          <h2 className="text-xl font-bold">Próximos partidos</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {(matches || []).map((match) => (
              <MatchCard key={match.id} match={match} prediction={predictionByMatch.get(match.id)} />
            ))}
          </div>
        </div>

        <aside className="panel p-4">
          <h2 className="text-xl font-bold">Ranking actual</h2>
          <div className="mt-4 grid gap-3">
            {(leaderboard || []).map((row, index) => (
              <div key={row.user_id} className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <p className="font-semibold">
                    {index + 1}. {row.profiles ? displayName(row.profiles) : row.user_id}
                  </p>
                  <p className="text-sm text-slate-600">{row.exact_predictions} exactos</p>
                </div>
                <span className="rounded-md bg-lime px-3 py-1 text-sm font-bold text-ink">
                  {row.total_points}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
