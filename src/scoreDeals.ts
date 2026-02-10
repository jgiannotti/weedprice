// scoreDeals.ts
// This module assigns a numeric score to normalized deals based on discount, distance, and recency.
// TODO: refine the scoring algorithm and calibrate weights for distance and freshness.

import { NormalizedDeal } from './normalizeDeals';

export interface ScoredDeal {
  deal: NormalizedDeal;
  score: number;
  distanceMiles: number;
}

/**
 * Compute the Haversine distance between two lat/lon points in miles.
 */
function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 3958.8; // Radius of Earth in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Score deals using a simple heuristic: base score is the percent discount (if available),
 * with additional boosts for freshness and closeness. Deals outside the radius are excluded.
 *
 * @param deals - Array of normalized deals
 * @param userLat - User's latitude
 * @param userLon - User's longitude
 * @param radiusMiles - Maximum distance in miles
 * @returns Array of ScoredDeal objects sorted by score descending
 */
export function scoreDeals(
  deals: NormalizedDeal[],
  userLat: number,
  userLon: number,
  radiusMiles: number
): ScoredDeal[] {
  const now = Date.now();
  return deals
    .map((deal) => {
      // Determine base discount score
      let base = 0;
      if (deal.discount && deal.discount.type === 'percent_off' && deal.discount.value != null) {
        base = deal.discount.value;
      } else if (deal.discount && deal.discount.type === 'bogo') {
        base = deal.discount.bogo_assumed_percent ?? 50;
      }
      // Compute recency boost: 10 points minus hours since last seen (min 0)
      let freshness = 0;
      if (deal.last_seen_utc) {
        const ageMs = now - Date.parse(deal.last_seen_utc);
        const ageHours = ageMs / (1000 * 60 * 60);
        freshness = Math.max(0, 10 - ageHours);
      }
      // TODO: compute distance using store coordinates; using 0 for placeholder
      const distanceMiles = 0;
      const distanceBoost = 0; // placeholder until store coordinates are available
      const score = base + freshness + distanceBoost;
      return { deal, score, distanceMiles } as ScoredDeal;
    })
    .filter((scored) => scored.distanceMiles <= radiusMiles)
    .sort((a, b) => b.score - a.score);
}
