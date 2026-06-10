import { redirect } from "next/navigation";
import { RefreshCw, Shield } from "lucide-react";
import { Notice } from "@/components/notice";
import { recalculateLeaderboard, saveMatch } from "@/lib/actions/admin";
import { createClient } from "@/lib/supabase/server";
import { formatMatchDate } from "@/lib/format";
import type { Match, Profile } from "@/lib/types";

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const notices = await searchParams;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [{ data: profile }, { data: matches }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
    supabase.from("matches").select("*").order("kickoff_at").returns<Match[]>()
  ]);

  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-ink text-white">
          <Shield size={20} />
        </span>
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-sm text-slate-600">Crear partidos, actualizar marcadores y recalcular.</p>
        </div>
      </div>
      <Notice error={notices.error} message={notices.message} />

      <section className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <form action={saveMatch} className="panel grid gap-4 p-5">
          <h2 className="text-xl font-bold">Nuevo partido</h2>
          <label className="grid gap-1 text-sm font-medium">
            Local
            <input className="field" name="home_team" required />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Visitante
            <input className="field" name="away_team" required />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Kickoff
            <input className="field" type="datetime-local" name="kickoff_at" required />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm font-medium">
              Local score
              <input className="field" type="number" min="0" max="99" name="home_score" />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Visitante score
              <input className="field" type="number" min="0" max="99" name="away_score" />
            </label>
          </div>
          <label className="grid gap-1 text-sm font-medium">
            Status
            <select className="field" name="status" defaultValue="scheduled">
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="finished">Finished</option>
            </select>
          </label>
          <button className="btn btn-primary" type="submit">
            Guardar partido
          </button>
        </form>

        <div className="panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Partidos</h2>
            <form action={recalculateLeaderboard}>
              <button className="btn btn-secondary" type="submit">
                <RefreshCw size={16} />
                Recalcular
              </button>
            </form>
          </div>
          <div className="mt-4 grid gap-3">
            {(matches || []).map((match) => (
              <details key={match.id} className="rounded-md border border-slate-200 p-4">
                <summary className="cursor-pointer font-semibold">
                  {match.home_team} vs {match.away_team} · {formatMatchDate(match.kickoff_at)}
                </summary>
                <form action={saveMatch} className="mt-4 grid gap-3 md:grid-cols-2">
                  <input type="hidden" name="id" value={match.id} />
                  <input className="field" name="home_team" defaultValue={match.home_team} required />
                  <input className="field" name="away_team" defaultValue={match.away_team} required />
                  <input
                    className="field"
                    type="datetime-local"
                    name="kickoff_at"
                    defaultValue={match.kickoff_at.slice(0, 16)}
                    required
                  />
                  <select className="field" name="status" defaultValue={match.status}>
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live</option>
                    <option value="finished">Finished</option>
                  </select>
                  <input
                    className="field"
                    type="number"
                    min="0"
                    max="99"
                    name="home_score"
                    defaultValue={match.home_score ?? ""}
                  />
                  <input
                    className="field"
                    type="number"
                    min="0"
                    max="99"
                    name="away_score"
                    defaultValue={match.away_score ?? ""}
                  />
                  <button className="btn btn-primary md:col-span-2" type="submit">
                    Actualizar
                  </button>
                </form>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
