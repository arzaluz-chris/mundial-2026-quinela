"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarClock, Lock, Pencil, ChevronRight } from "lucide-react";
import { formatMatchDate, getTeamAbbreviation } from "@/lib/format";
import type { Match, Prediction } from "@/lib/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function TeamAvatar({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-white shadow-sm">
        <span className="text-sm font-bold text-slate-600">
          {getTeamAbbreviation(name)}
        </span>
      </div>
      <span className="text-xs font-semibold text-slate-700 text-center">{name}</span>
    </div>
  );
}

export function MatchCard({
  match,
  prediction
}: {
  match: Match;
  prediction?: Prediction | null;
}) {
  const locked = new Date(match.kickoff_at).getTime() <= Date.now();
  const isLive = match.status === "live";

  return (
    <motion.article 
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={cn(
        "panel relative overflow-hidden group",
        isLive && "ring-2 ring-coral/50"
      )}
    >
      {isLive && (
        <div className="absolute top-0 right-0 rounded-bl-xl bg-coral px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
          En vivo
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6 pt-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-pitchDark">
          {match.status === "scheduled" ? "Próximo" : match.status === "finished" ? "Finalizado" : "En Juego"}
        </p>
        <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <CalendarClock size={14} />
          {formatMatchDate(match.kickoff_at)}
        </p>
      </div>

      <div className="flex items-center justify-between px-2">
        <TeamAvatar name={match.home_team} />
        
        <div className="flex flex-col items-center justify-center px-4">
          <span className="mb-1 text-xs font-bold text-slate-400">VS</span>
          <div className="flex items-center gap-2 rounded-lg bg-slate-100/80 px-4 py-2 font-bold text-ink shadow-inner">
            <span className="text-xl">{match.home_score ?? "-"}</span>
            <span className="text-slate-400">:</span>
            <span className="text-xl">{match.away_score ?? "-"}</span>
          </div>
        </div>

        <TeamAvatar name={match.away_team} />
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Tu pick:</span>
          {prediction ? (
            <span className="inline-flex items-center justify-center rounded bg-white px-2 py-1 text-sm font-bold text-pitch shadow-sm">
              {prediction.predicted_home_score} - {prediction.predicted_away_score}
            </span>
          ) : (
            <span className="text-sm font-medium text-slate-400 italic">Pendiente</span>
          )}
        </div>
        
        <Link 
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
            locked 
              ? "bg-slate-200 text-slate-500" 
              : "bg-lime text-pitchDark hover:bg-[#cbf041] hover:scale-105 active:scale-95"
          )}
          href={`/matches/${match.id}`}
        >
          {locked ? (
            <>
              <Lock size={14} />
              Cerrado
            </>
          ) : (
            <>
              <Pencil size={14} />
              Predecir
            </>
          )}
        </Link>
      </div>
    </motion.article>
  );
}
