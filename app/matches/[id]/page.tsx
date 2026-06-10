import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Lock, Users, ChevronLeft, CalendarClock } from "lucide-react";
import { Notice } from "@/components/notice";
import { PredictionForm } from "@/components/prediction-form";
import { createClient } from "@/lib/supabase/server";
import { canViewCommunityPredictions } from "@/lib/scoring";
import { displayName, formatMatchDate, getTeamAbbreviation } from "@/lib/format";
import type { Match, Prediction, PredictionWithProfile } from "@/lib/types";

export default async function MatchDetailsPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { id } = await params;
  const notices = await searchParams;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: match } = await supabase.from("matches").select("*").eq("id", id).single<Match>();
  if (!match) notFound();

  const { data: prediction } = await supabase
    .from("predictions")
    .select("*")
    .eq("match_id", id)
    .eq("user_id", user.id)
    .maybeSingle<Prediction>();

  const communityVisible = canViewCommunityPredictions(match.kickoff_at);
  const { data: communityPredictions } = communityVisible
    ? await supabase
        .from("predictions")
        .select("*, profiles(display_name,email)")
        .eq("match_id", id)
        .order("created_at")
        .returns<PredictionWithProfile[]>()
    : { data: [] as PredictionWithProfile[] };

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-8">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-pitch transition-colors">
          <ChevronLeft size={16} />
          Volver al dashboard
        </Link>
      </div>
      <Notice error={notices.error} message={notices.message} />

      <section className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="panel flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pitch/5 to-transparent pointer-events-none" />
          
          <p className="text-xs font-bold uppercase tracking-widest text-pitchDark bg-lime/20 px-3 py-1 rounded-full mb-6 relative">
            {match.status === "scheduled" ? "Próximo partido" : match.status === "live" ? "En vivo" : "Finalizado"}
          </p>
          
          <div className="flex items-center justify-center gap-8 w-full relative">
            <div className="flex flex-col items-center gap-3">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-white border border-slate-200 shadow-md">
                <span className="text-xl font-bold text-slate-600">
                  {getTeamAbbreviation(match.home_team)}
                </span>
              </div>
              <span className="font-bold text-slate-800 text-lg">{match.home_team}</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-slate-400 mb-2">VS</span>
              <div className="inline-flex rounded-xl bg-slate-100/80 px-6 py-3 text-3xl font-extrabold text-ink shadow-inner border border-slate-200/50">
                {match.home_score ?? "-"} <span className="mx-2 text-slate-400 font-medium">:</span> {match.away_score ?? "-"}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-white border border-slate-200 shadow-md">
                <span className="text-xl font-bold text-slate-600">
                  {getTeamAbbreviation(match.away_team)}
                </span>
              </div>
              <span className="font-bold text-slate-800 text-lg">{match.away_team}</span>
            </div>
          </div>
          
          <p className="mt-8 flex items-center gap-2 text-sm font-medium text-slate-500 bg-white/50 px-4 py-2 rounded-lg relative border border-slate-100 shadow-sm">
            <CalendarClock size={16} className="text-pitch" />
            {formatMatchDate(match.kickoff_at)}
          </p>
        </div>

        <aside className="panel p-8">
          <h2 className="text-xl font-extrabold flex items-center gap-2 mb-6">
            <span className="w-1.5 h-6 rounded-full bg-pitch inline-block"></span>
            Tu predicción
          </h2>
          <PredictionForm match={match} prediction={prediction} />
        </aside>
      </section>

      <section className="panel p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
          <h2 className="flex items-center gap-2 text-xl font-extrabold">
            <Users size={22} className="text-pitch" />
            Predicciones de la comunidad
          </h2>
          {!communityVisible && (
            <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600">
              <Lock size={15} />
              Visible al kickoff
            </span>
          )}
        </div>
        
        {communityVisible ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-slate-500 font-semibold bg-slate-50/50">
                <tr>
                  <th className="py-3 px-4 rounded-tl-lg">Usuario</th>
                  <th className="py-3 px-4 rounded-tr-lg">Predicción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {(communityPredictions || []).map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="py-3 px-4">
                      {item.profiles ? displayName(item.profiles) : item.user_id}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center justify-center rounded bg-lime/20 border border-lime/30 px-3 py-1 text-sm font-bold text-pitchDark shadow-sm">
                        {item.predicted_home_score} - {item.predicted_away_score}
                      </span>
                    </td>
                  </tr>
                ))}
                {(communityPredictions || []).length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-8 text-center text-slate-500 italic">
                      Nadie hizo predicciones para este partido.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-400 mb-4 shadow-inner">
              <Lock size={24} />
            </div>
            <p className="text-slate-600 font-medium max-w-sm">
              Antes del kickoff, las predicciones son secretas. Podrás ver los pronósticos de los demás una vez que inicie el partido.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
