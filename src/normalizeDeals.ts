// normalizeDeals.ts
// This module defines functions to normalize raw deal data into a consistent schema.
// TODO: implement proper extraction of discount values, categories, dates, and confidence scoring.

export interface NormalizedDeal {
  deal_id: string;
  brand_id: string;
  brand_name: string;
  store_id: string | null;
  title: string;
  description: string;
  category: string;
  discount: {
    type: 'percent_off' | 'dollar_off' | 'bogo' | 'bundle' | 'unknown';
    value: number | null;
    bogo_assumed_percent: number | null;
  };
  terms: string[];
  start_utc: string | null;
  end_utc: string | null;
  source_url: string;
  detected_utc: string;
  last_seen_utc: string;
  confidence: number;
}

/**
 * Normalize a list of raw deal objects into the NormalizedDeal schema. This is a placeholder
 * implementation that simply casts the input deals into the expected format. You should replace
 * this with logic that parses deal text, extracts discount values, categories, and terms, and
 * computes confidence scores.
 *
 * @param rawDeals - Array of raw deal objects scraped from dispensary websites.
 * @returns Array of NormalizedDeal objects.
 */
export function normalizeDeals(rawDeals: any[]): NormalizedDeal[] {
  return rawDeals.map((deal: any) => {
    return {
      deal_id: deal.deal_id ?? '',
      brand_id: deal.brand_id ?? '',
      brand_name: deal.brand_name ?? '',
      store_id: deal.store_id ?? null,
      title: deal.title ?? '',
      description: deal.description ?? '',
      category: deal.category ?? 'general',
      discount: deal.discount ?? { type: 'unknown', value: null, bogo_assumed_percent: null },
      terms: deal.terms ?? [],
      start_utc: deal.start_utc ?? null,
      end_utc: deal.end_utc ?? null,
      source_url: deal.source_url ?? '',
      detected_utc: deal.detected_utc ?? new Date().toISOString(),
      last_seen_utc: deal.last_seen_utc ?? new Date().toISOString(),
      confidence: deal.confidence ?? 0.0,
    } as NormalizedDeal;
  });
}
