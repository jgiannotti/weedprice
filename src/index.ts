import * as fs from 'fs/promises';
import path from 'path';
import { parseOmmu, Store } from './parseOmmu';
import { geocodeAddress } from './geocode';
import { discoverSources, DealSource } from './discoverSources';
import { scrapeDeals, RawDeal } from './scrapeDeals';
import { normalizeDeals, NormalizedDeal } from './normalizeDeals';
import { buildOutputs } from './buildOutputs';
import { computeStatus, BrandStatus, StatusSummary } from './healthcheck';
import { publishOutputs, PublishConfig } from './publishToKv';

// Helper to slugify brand names into IDs
function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

export async function main(): Promise<void> {
  console.log('Starting DankDeals.ai pipeline');

  // Step 1: Fetch dispensary store data from OMMU
  const stores = await parseOmmu();
  console.log(`Fetched ${stores.length} stores`);

  // Step 2: Geocode each store to get lat/lon
  const geocodedStores: Array<Store & { lat: number | null; lon: number | null }> = [];
  for (const store of stores) {
    try {
      const address = `${store.address}, ${store.city}, ${store.county}, FL ${store.zip}`;
      const { lat, lon } = await geocodeAddress(address);
      geocodedStores.push({ ...store, lat, lon });
    } catch (err) {
      console.warn(`Geocode failed for ${store.company} ${store.address}: ${(err as any).message}`);
      geocodedStores.push({ ...store, lat: null, lon: null });
    }
  }

  // Step 3: Build brand registry from stores (brandId, brandName, website placeholder)
  interface Brand {
    brandId: string;
    brandName: string;
    website: string;
  }
  const brandMap = new Map<string, Brand>();
  for (const store of geocodedStores) {
    const brandId = slugify(store.company);
    if (!brandMap.has(brandId)) {
      // Use a placeholder website; in production you would parse OMMU or other sources to get real links
      brandMap.set(brandId, { brandId, brandName: store.company, website: `https://${brandId}.com` });
    }
  }

  // Step 4: Discover deal sources for each brand
  const sourcesByBrand: Record<string, DealSource[]> = {};
  for (const brand of brandMap.values()) {
    try {
      const sources = await discoverSources(brand.brandId, brand.website);
      sourcesByBrand[brand.brandId] = sources;
    } catch (err) {
      console.warn(`Source discovery failed for ${brand.brandName}: ${(err as any).message}`);
      sourcesByBrand[brand.brandId] = [];
    }
  }

  // Step 5: Scrape deals from discovered sources
  const rawDeals: RawDeal[] = await scrapeDeals(sourcesByBrand);
  console.log(`Scraped ${rawDeals.length} raw deals`);

  // Step 6: Normalize raw deals into structured data
  const normalizedDeals: NormalizedDeal[] = normalizeDeals(rawDeals);

  // Step 7: Build best deals output (using a Tampa default location for scoring)
  const tampaLat = 27.9506;
  const tampaLon = -82.4572;
  const radiusMiles = 15;
  const { deals: finalDeals, best } = buildOutputs(normalizedDeals, tampaLat, tampaLon, radiusMiles);

  // Step 8: Compute status summary (simplified: mark each brand as OK if we found any deals)
  const statusEntries: Array<BrandStatus> = [];
  for (const brand of brandMap.values()) {
    const brandDeals = normalizedDeals.filter(d => d.brand_id === brand.brandId);
    const ok = brandDeals.length > 0;
    statusEntries.push({
      brandId: brand.brandId,
      status: ok ? 'ok' : 'stale',
      lastSuccess: ok ? new Date() : null,
      lastError: ok ? null : new Date(),
      consecutiveFailures: ok ? 0 : 1
    });
  }
  const statusSummary: StatusSummary = computeStatus(statusEntries);

  // Step 9: Write outputs to out directory
  const outDir = path.resolve(process.cwd(), 'pipeline_out');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'stores.v1.json'), JSON.stringify(geocodedStores, null, 2));
  await fs.writeFile(path.join(outDir, 'brands.v1.json'), JSON.stringify(Array.from(brandMap.values()), null, 2));
  await fs.writeFile(path.join(outDir, 'sources.v1.json'), JSON.stringify(sourcesByBrand, null, 2));
  await fs.writeFile(path.join(outDir, 'deals.v1.json'), JSON.stringify(normalizedDeals, null, 2));
  await fs.writeFile(path.join(outDir, 'best.v1.json'), JSON.stringify(best, null, 2));
  await fs.writeFile(path.join(outDir, 'status.v1.json'), JSON.stringify(statusSummary, null, 2));
  console.log(`Wrote pipeline outputs to ${outDir}`);

  // Step 10: Optionally publish to Cloudflare KV if environment variables are present
  if (process.env.CF_API_TOKEN && process.env.CF_ACCOUNT_ID && process.env.CF_NAMESPACE_ID) {
    const cfg: PublishConfig = {
      accountId: process.env.CF_ACCOUNT_ID!,
      namespaceId: process.env.CF_NAMESPACE_ID!,
      apiToken: process.env.CF_API_TOKEN!,
      region: process.env.CF_REGION
    };
    await publishOutputs(outDir, cfg);
    console.log('Published outputs to Cloudflare KV');
  } else {
    console.log('Cloudflare credentials not set; skipping publish');
  }
}

// If executed directly via node
if (typeof require !== 'undefined' && require.main === module) {
  main().catch(err => {
    console.error(err);
  });
}
