import { redirect } from "next/navigation";
import { MatchCard } from "@/components/match-card";
import { SignOutButton } from "@/components/sign-out-button";
import { createClient } from "@/lib/supabase/server";
import { displayName } from "@/lib/format";
import type { LeaderboardRow, Match, Prediction, Profile } from "@/lib/types";
import { Trophy } from "lucide-react";

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
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end mb-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-pitchDark mb-1">
            Mundial FIFA 2026
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pitchDark to-pitch">
            Hola, {profile ? displayName(profile) : user.email}
          </h1>
        </div>
        <SignOutButton />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <span className="w-2 h-6 rounded-full bg-lime inline-block"></span>
            Próximos partidos
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            {(matches || []).map((match) => (
              <MatchCard key={match.id} match={match} prediction={predictionByMatch.get(match.id)} />
            ))}
            {(matches || []).length === 0 && (
              <div className="col-span-full panel text-center py-12 text-slate-500">
                No hay partidos programados aún.
              </div>
            )}
          </div>
        </div>

        <aside>
          <div className="panel sticky top-24">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Trophy size={20} className="text-amber-500" />
              Top 5 Ranking
            </h2>
            <div className="grid gap-4">
              {(leaderboard || []).map((row, index) => (
                <div key={row.user_id} className="group flex items-center justify-between border-b border-slate-100/50 pb-3 transition-colors hover:bg-slate-50/50 -mx-2 px-2 rounded-lg pt-1">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                      index === 0 ? "bg-amber-100 text-amber-700" :
                      index === 1 ? "bg-slate-100 text-slate-600" :
                      index === 2 ? "bg-orange-100 text-orange-800" :
                      "bg-white text-slate-400"
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-800 group-hover:text-pitch transition-colors">
                        {row.profiles ? displayName(row.profiles) : row.user_id}
                      </p>
                      <p className="text-xs font-medium text-slate-500">{row.exact_predictions} exactos</p>
                    </div>
                  </div>
                  <span className="rounded-md bg-lime/20 border border-lime/50 px-3 py-1 text-sm font-bold text-pitchDark shadow-sm">
                    {row.total_points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
