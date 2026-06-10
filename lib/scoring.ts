export type ScoreInput = {
  predictedHome: number;
  predictedAway: number;
  homeScore: number;
  awayScore: number;
};

const sign = (value: number) => (value === 0 ? 0 : value > 0 ? 1 : -1);

export function calculatePredictionPoints(input: ScoreInput) {
  const predictedDiff = input.predictedHome - input.predictedAway;
  const actualDiff = input.homeScore - input.awayScore;

  if (
    input.predictedHome === input.homeScore &&
    input.predictedAway === input.awayScore
  ) {
    return { points: 5, exact: true };
  }

  if (sign(predictedDiff) === sign(actualDiff) && predictedDiff === actualDiff) {
    return { points: 3, exact: false };
  }

  if (sign(predictedDiff) === sign(actualDiff)) {
    return { points: 1, exact: false };
  }

  return { points: 0, exact: false };
}

export function isPredictionLocked(kickoffAt: string) {
  return new Date(kickoffAt).getTime() <= Date.now();
}

export function canViewCommunityPredictions(kickoffAt: string) {
  return isPredictionLocked(kickoffAt);
}
