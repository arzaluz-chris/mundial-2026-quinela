import Link from "next/link";
import { CalendarClock, Lock, Pencil } from "lucide-react";
import { formatMatchDate } from "@/lib/format";
import type { Match, Prediction } from "@/lib/types";

export function MatchCard({
  match,
  prediction
}: {
  match: Match;
  prediction?: Prediction | null;
}) {
  const locked = new Date(match.kickoff_at).getTime() <= Date.now();

  return (
    <article className="panel p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-pitch">
            {match.status}
          </p>
          <h3 className="mt-1 text-lg font-bold">
            {match.home_team} vs {match.away_team}
          </h3>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <CalendarClock size={16} />
            {formatMatchDate(match.kickoff_at)}
          </p>
        </div>
        <span className="rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold">
          {match.home_score ?? "-"} - {match.away_score ?? "-"}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-sm text-slate-700">
          Tu pick:{" "}
          <strong>
            {prediction
              ? `${prediction.predicted_home_score}-${prediction.predicted_away_score}`
              : "pendiente"}
          </strong>
        </p>
        <Link className="btn btn-secondary" href={`/matches/${match.id}`}>
          {locked ? <Lock size={16} /> : <Pencil size={16} />}
          Ver
        </Link>
      </div>
    </article>
  );
}
