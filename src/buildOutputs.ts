// buildOutputs.ts
// This module assembles the final JSON outputs from normalized and scored deals.
// It can produce per-brand, per-store, and overall best deals lists, ready for publishing to KV.

import { NormalizedDeal } from './normalizeDeals';
import { scoreDeals, ScoredDeal } from './scoreDeals';

export interface BestDealsOutput {
  generated_utc: string;
  items: { deal_id: string; score: number }[];
}

/**
 * Generate a list of the top N deals based on score. Assumes the deals have been
 * normalized and scored. Returns a JSON structure containing the generation
 * timestamp and references to the top deals with their scores.
 */
export function buildBestDeals(
  deals: NormalizedDeal[],
  userLat: number,
  userLon: number,
  radiusMiles: number,
  maxItems = 50,
): BestDealsOutput {
  const scored: ScoredDeal[] = scoreDeals(deals, userLat, userLon, radiusMiles);
  const top = scored.slice(0, maxItems).map((s) => ({ deal_id: s.deal.deal_id, score: s.score }));
  return {
    generated_utc: new Date().toISOString(),
    items: top,
  };
}

/**
 * Build full outputs for publication. In a complete implementation, this function would
 * generate additional indexes, such as deals-by-brand and deals-by-store. For now it
 * returns the raw deals and the best deals summary.
 */
export function buildOutputs(
  deals: NormalizedDeal[],
  userLat: number,
  userLon: number,
  radiusMiles: number,
): { deals: NormalizedDeal[]; best: BestDealsOutput } {
  const best = buildBestDeals(deals, userLat, userLon, radiusMiles);
  return {
    deals,
    best,
  };
}
