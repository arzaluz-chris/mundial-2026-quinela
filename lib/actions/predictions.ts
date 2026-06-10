"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function parseScore(formData: FormData, key: string) {
  const raw = formData.get(key);
  const score = typeof raw === "string" ? Number.parseInt(raw, 10) : Number.NaN;
  if (!Number.isInteger(score) || score < 0 || score > 99) {
    throw new Error("Marcador invalido");
  }
  return score;
}

export async function upsertPrediction(formData: FormData) {
  const supabase = await createClient();
  const matchId = String(formData.get("match_id") || "");
  const predictedHomeScore = parseScore(formData, "predicted_home_score");
  const predictedAwayScore = parseScore(formData, "predicted_away_score");

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { error } = await supabase.from("predictions").upsert(
    {
      user_id: user.id,
      match_id: matchId,
      predicted_home_score: predictedHomeScore,
      predicted_away_score: predictedAwayScore
    },
    {
      onConflict: "user_id,match_id"
    }
  );

  if (error) {
    redirect(`/matches/${matchId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/matches/${matchId}`);
  redirect(`/matches/${matchId}?message=Prediccion guardada.`);
}
