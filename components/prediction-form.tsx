"use client";

import { Save, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { upsertPrediction } from "@/lib/actions/predictions";
import type { Match, Prediction } from "@/lib/types";

function SubmitButton({ locked }: { locked: boolean }) {
  const { pending } = useFormStatus();
  
  return (
    <button 
      className="btn btn-primary" 
      type="submit" 
      disabled={locked || pending}
    >
      {pending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Save size={16} />
      )}
      {locked ? "Predicción bloqueada" : pending ? "Guardando..." : "Guardar predicción"}
    </button>
  );
}

export function PredictionForm({
  match,
  prediction
}: {
  match: Match;
  prediction?: Prediction | null;
}) {
  const locked = new Date(match.kickoff_at).getTime() <= Date.now();

  return (
    <form action={upsertPrediction} className="grid gap-6">
      <input type="hidden" name="match_id" value={match.id} />
      <div className="grid grid-cols-2 gap-4">
        <label className="grid gap-2 text-sm font-semibold text-slate-700 text-center">
          {match.home_team}
          <input
            className="field text-center text-xl font-bold h-16"
            type="number"
            min="0"
            max="99"
            name="predicted_home_score"
            defaultValue={prediction?.predicted_home_score ?? ""}
            disabled={locked}
            required
            placeholder="0"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700 text-center">
          {match.away_team}
          <input
            className="field text-center text-xl font-bold h-16"
            type="number"
            min="0"
            max="99"
            name="predicted_away_score"
            defaultValue={prediction?.predicted_away_score ?? ""}
            disabled={locked}
            required
            placeholder="0"
          />
        </label>
      </div>
      <SubmitButton locked={locked} />
    </form>
  );
}
