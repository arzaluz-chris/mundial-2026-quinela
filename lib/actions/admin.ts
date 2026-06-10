"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { MatchStatus } from "@/lib/types";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullableScore(formData: FormData, key: string) {
  const value = getString(formData, key);
  if (!value) return null;
  const score = Number.parseInt(value, 10);
  if (!Number.isInteger(score) || score < 0 || score > 99) throw new Error("Score invalido");
  return score;
}

export async function saveMatch(formData: FormData) {
  const supabase = await createClient();
  const id = getString(formData, "id");
  const status = getString(formData, "status") as MatchStatus;
  const payload = {
    home_team: getString(formData, "home_team"),
    away_team: getString(formData, "away_team"),
    kickoff_at: getString(formData, "kickoff_at"),
    home_score: nullableScore(formData, "home_score"),
    away_score: nullableScore(formData, "away_score"),
    status
  };

  const query = id
    ? supabase.from("matches").update(payload).eq("id", id)
    : supabase.from("matches").insert(payload);

  const { error } = await query;
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  redirect("/admin?message=Partido guardado.");
}

export async function recalculateLeaderboard() {
  const supabase = await createClient();
  const { error } = await supabase.rpc("recalculate_leaderboard");
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/leaderboard");
  revalidatePath("/dashboard");
  redirect("/admin?message=Leaderboard recalculado.");
}
