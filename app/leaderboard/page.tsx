import { Medal } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { displayName } from "@/lib/format";
import type { LeaderboardRow } from "@/lib/types";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("leaderboard")
    .select("*, profiles(display_name,email)")
    .order("total_points", { ascending: false })
    .order("exact_predictions", { ascending: false })
    .returns<LeaderboardRow[]>();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-lime text-ink">
          <Medal size={21} />
        </span>
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-sm text-slate-600">Ordenado por puntos y exactos.</p>
        </div>
      </div>

      <div className="panel mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Puntos</th>
              <th className="px-4 py-3">Exactos</th>
            </tr>
          </thead>
          <tbody>
            {(rows || []).map((row, index) => (
              <tr key={row.user_id} className="border-b border-slate-100">
                <td className="px-4 py-3 font-bold">{index + 1}</td>
                <td className="px-4 py-3">
                  {row.profiles ? displayName(row.profiles) : row.user_id}
                </td>
                <td className="px-4 py-3 font-bold">{row.total_points}</td>
                <td className="px-4 py-3">{row.exact_predictions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
