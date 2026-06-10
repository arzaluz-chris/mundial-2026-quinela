export type MatchStatus = "scheduled" | "live" | "finished";
export type UserRole = "user" | "admin";

export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  role: UserRole;
  created_at: string;
};

export type Match = {
  id: string;
  home_team: string;
  away_team: string;
  kickoff_at: string;
  home_score: number | null;
  away_score: number | null;
  status: MatchStatus;
  created_at: string;
};

export type Prediction = {
  id: string;
  user_id: string;
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  created_at: string;
  updated_at: string;
};

export type LeaderboardRow = {
  user_id: string;
  total_points: number;
  exact_predictions: number;
  updated_at: string;
  profiles: Pick<Profile, "display_name" | "email"> | null;
};

export type PredictionWithProfile = Prediction & {
  profiles: Pick<Profile, "display_name" | "email"> | null;
};
