import fetch from 'node-fetch';

/**
 * Represents a discovered deals source for a given brand. Each source includes
 * a URL and a type indicating how it should be scraped (e.g., static
 * HTML, embedded JSON, headless). More fields can be added as needed.
 */
export interface DealSource {
  brandId: string;
  url: string;
  type: 'static' | 'embedded-json' | 'headless' | 'unknown';
}

/**
 * Attempts to discover possible deals or promotions pages for a given brand
 * website. It fetches the homepage and looks for anchor tags containing
 * keywords related to deals (e.g., deals, specials, promotions). The result
 * includes a list of candidate URLs and assigns each a type of 'static' by
 * default. More advanced logic can be added to inspect each page and
 * determine if headless scraping is needed.
 */
export async function discoverSources(brandId: string, website: string): Promise<DealSource[]> {
  const keywords = ['deals', 'specials', 'promotions', 'offers', 'discount'];
  const sources: DealSource[] = [];
  try {
    const res = await fetch(website);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${website}: ${res.status}`);
    }
    const html = await res.text();
    // naive search: find occurrences of keyword in anchor hrefs
    keywords.forEach((keyword) => {
      const regex = new RegExp(`<a[^>]+href=["']([^"']*${keyword}[^"']*)["'][^>]*>`, 'gi');
      let match: RegExpExecArray | null;
      while ((match = regex.exec(html))) {
        const url = match[1];
        // Ensure uniqueness
        if (!sources.find((s) => s.url === url)) {
          sources.push({ brandId, url: url.startsWith('http') ? url : new URL(url, website).toString(), type: 'static' });
        }
      }
    });
  } catch (err) {
    console.error(`discoverSources error for ${brandId}:`, err);
  }
  return sources;
}
