import { Save } from "lucide-react";
import { upsertPrediction } from "@/lib/actions/predictions";
import type { Match, Prediction } from "@/lib/types";

export function PredictionForm({
  match,
  prediction
}: {
  match: Match;
  prediction?: Prediction | null;
}) {
  const locked = new Date(match.kickoff_at).getTime() <= Date.now();

  return (
    <form action={upsertPrediction} className="grid gap-4">
      <input type="hidden" name="match_id" value={match.id} />
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1 text-sm font-medium">
          {match.home_team}
          <input
            className="field"
            type="number"
            min="0"
            max="99"
            name="predicted_home_score"
            defaultValue={prediction?.predicted_home_score ?? ""}
            disabled={locked}
            required
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          {match.away_team}
          <input
            className="field"
            type="number"
            min="0"
            max="99"
            name="predicted_away_score"
            defaultValue={prediction?.predicted_away_score ?? ""}
            disabled={locked}
            required
          />
        </label>
      </div>
      <button className="btn btn-primary" type="submit" disabled={locked}>
        <Save size={16} />
        {locked ? "Prediccion bloqueada" : "Guardar prediccion"}
      </button>
    </form>
  );
}
