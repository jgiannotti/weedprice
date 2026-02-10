import fs from 'fs/promises';
import fetch from 'node-fetch';

export interface PublishConfig {
  accountId: string;
  namespaceId: string;
  apiToken: string;
  region?: string;
}

async function uploadKey(key: string, value: string, cfg: PublishConfig): Promise<void> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${cfg.accountId}/storage/kv/namespaces/${cfg.namespaceId}/values/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${cfg.apiToken}`,
      'Content-Type': 'text/plain'
    },
    body: value
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to upload ${key}: ${res.status} ${text}`);
  }
}

/**
 * Publish all generated output files from the pipeline to Cloudflare KV.
 * @param outDir The directory containing JSON outputs, e.g. "out".
 * @param cfg Configuration containing Cloudflare account, namespace, and token.
 */
export async function publishOutputs(outDir: string, cfg: PublishConfig) {
  const keys = [
    { key: 'stores:v1', file: `${outDir}/stores.v1.json` },
    { key: 'brands:v1', file: `${outDir}/brands.v1.json` },
    { key: 'sources:v1', file: `${outDir}/sources.v1.json` },
    { key: 'deals:v1', file: `${outDir}/deals.v1.json` },
    { key: 'best:v1', file: `${outDir}/best.v1.json` },
    { key: 'status:v1', file: `${outDir}/status.v1.json` },
  ];

  for (const { key, file } of keys) {
    try {
      const value = await fs.readFile(file, 'utf-8');
      await uploadKey(key, value, cfg);
      console.log(`Uploaded ${key}`);
    } catch (err) {
      console.error(`Error uploading ${key}:`, err);
    }
  }
}
