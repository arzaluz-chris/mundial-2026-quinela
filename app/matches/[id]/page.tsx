import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Lock, Users } from "lucide-react";
import { Notice } from "@/components/notice";
import { PredictionForm } from "@/components/prediction-form";
import { createClient } from "@/lib/supabase/server";
import { canViewCommunityPredictions } from "@/lib/scoring";
import { displayName, formatMatchDate } from "@/lib/format";
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
    <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8">
      <Link href="/dashboard" className="text-sm font-semibold text-pitch">
        Volver al dashboard
      </Link>
      <Notice error={notices.error} message={notices.message} />

      <section className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="panel p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-pitch">
            {match.status}
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            {match.home_team} vs {match.away_team}
          </h1>
          <p className="mt-3 text-slate-600">{formatMatchDate(match.kickoff_at)}</p>
          <div className="mt-6 inline-flex rounded-md bg-slate-100 px-4 py-2 text-2xl font-bold">
            {match.home_score ?? "-"} - {match.away_score ?? "-"}
          </div>
        </div>

        <aside className="panel p-6">
          <h2 className="text-xl font-bold">Tu predicción</h2>
          <div className="mt-4">
            <PredictionForm match={match} prediction={prediction} />
          </div>
        </aside>
      </section>

      <section className="panel p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Users size={20} />
            Predicciones de la comunidad
          </h2>
          {!communityVisible && (
            <span className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold">
              <Lock size={15} />
              Visible al kickoff
            </span>
          )}
        </div>
        {communityVisible ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2">Usuario</th>
                  <th className="py-2">Predicción</th>
                </tr>
              </thead>
              <tbody>
                {(communityPredictions || []).map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-3">
                      {item.profiles ? displayName(item.profiles) : item.user_id}
                    </td>
                    <td className="py-3 font-semibold">
                      {item.predicted_home_score}-{item.predicted_away_score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-600">
            Antes del kickoff cada participante solo ve su propia predicción.
          </p>
        )}
      </section>
    </main>
  );
}
