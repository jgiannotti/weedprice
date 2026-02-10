import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

/**
 * Represents a single dispensary location entry parsed from the OMMU MMTC table.
 */
export interface Store {
  company: string;
  address: string;
  city: string;
  zip: string;
  county: string;
}

/**
 * Fetches and parses the Florida OMMU MMTC dispensing locations table.
 *
 * The OMMU page loads its table via JavaScript (DataTables), but the raw HTML
 * still contains all rows. This function fetches the HTML and extracts each
 * table row's columns using cheerio. If the page structure changes, you may
 * need to update the selectors.
 */
export async function parseOmmu(): Promise<Store[]> {
  const url = 'https://knowthefactsmmj.com/mmtc/';

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch OMMU page: ${res.status}`);
  }
  const html = await res.text();
  const $ = cheerio.load(html);

  const stores: Store[] = [];

  // Select rows from the dispensing locations table. We look for all table rows
  // that contain at least 7 columns; DataTables marks the table with a
  // distinctive class. Even if this class changes, the row structure should
  // remain similar.
  $('table tbody tr').each((_, row) => {
    const cols = $(row)
      .find('td')
      .map((_, cell) => $(cell).text().trim())
      .get();
    // Ensure we have enough columns. The known order is:
    // [company, address, email, phone, city, zip, county]
    if (cols.length >= 7) {
      const company = cols[0];
      const address = cols[1];
      const city = cols[4];
      const zip = cols[5];
      const county = cols[6];
      stores.push({ company, address, city, zip, county });
    }
  });

  return stores;
}
