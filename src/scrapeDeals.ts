// scrapeDeals.ts
// This module is responsible for fetching and parsing promotional deal data from dispensary websites.
// It defines interfaces for raw scraped deals and exposes functions to fetch and parse HTML.
// TODO: implement specific scraping adapters for static HTML, embedded JSON, and headless browsers.

import fetch from 'node-fetch';
import cheerio from 'cheerio';

export interface RawDeal {
  deal_id: string;
  brand_id: string;
  brand_name: string;
  store_id: string | null;
  title: string;
  description: string;
  source_url: string;
  detected_utc: string;
}

/**
 * Fetch a URL and return the response body as a string.
 */
export async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': 'DankDealsBot/1.0 (+https://dankdeals.ai)' } });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return await res.text();
}

/**
 * Parse deals from an HTML document. This is a placeholder implementation that simply
 * extracts list items containing discount keywords. You should replace this with
 * logic tailored to each dispensary's deals page structure.
 */
export function parseDealsFromHtml(html: string, brandId: string, brandName: string, url: string): RawDeal[] {
  const $ = cheerio.load(html);
  const deals: RawDeal[] = [];
  $('li, div, p').each((_, elem) => {
    const text = $(elem).text().trim();
    if (!text) return;
    // Heuristic: if text contains percent sign or BOGO keyword, consider as a deal
    if (/%/i.test(text) || /bogo/i.test(text) || /off/i.test(text)) {
      deals.push({
        deal_id: '',
        brand_id: brandId,
        brand_name: brandName,
        store_id: null,
        title: text.split('.')[0].slice(0, 100),
        description: text,
        source_url: url,
        detected_utc: new Date().toISOString(),
      });
    }
  });
  return deals;
}

/**
 * Scrape deals for a single brand given a list of candidate URLs. This function
 * fetches each URL, parses the HTML, and aggregates raw deals. Duplicate deals
 * across URLs are not deduplicated here.
 */
export async function scrapeDealsForBrand(
  brandId: string,
  brandName: string,
  urls: string[],
): Promise<RawDeal[]> {
  const results: RawDeal[] = [];
  for (const url of urls) {
    try {
      const html = await fetchHtml(url);
      const deals = parseDealsFromHtml(html, brandId, brandName, url);
      results.push(...deals);
    } catch (err) {
      console.warn(`Error scraping ${url}:`, err);
    }
  }
  return results;
}

/**
 * Scrape deals for multiple brands. Each source record includes the brand ID, brand name,
 * and a list of URLs to check. Returns an array of RawDeal objects aggregated across all brands.
 */
export async function scrapeDeals(
  sources: { brandId: string; brandName: string; urls: string[] }[],
): Promise<RawDeal[]> {
  const aggregated: RawDeal[] = [];
  for (const source of sources) {
    const deals = await scrapeDealsForBrand(source.brandId, source.brandName, source.urls);
    aggregated.push(...deals);
  }
  return aggregated;
}
