export interface ScoringThresholds {
  litMultiplier: number;
  digIconMultiplier: number;
  digCardNumerator: number;
  digCardDenominator: number;
  litCutoff: number;
  digCutoff: number;
}

export const defaultScoringThresholds: ScoringThresholds = {
  litMultiplier: 12.5,
  digIconMultiplier: 12.5,
  digCardNumerator: 25,
  digCardDenominator: 3,
  litCutoff: 25,
  digCutoff: 25,
};
