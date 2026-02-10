/**
 * Computes status metrics for each brand across the data pipeline.
 */
export interface BrandStatus {
  brandId: string;
  status: 'ok' | 'stale' | 'failed';
  lastSuccess: Date | null;
  lastError: Date | null;
  consecutiveFailures: number;
}

export interface StatusSummary {
  ok: number;
  stale: number;
  failed: number;
  brands: BrandStatus[];
}

export function computeStatus(statusData: any[]): StatusSummary {
  // Placeholder: just compute counts for statuses
  const summary: StatusSummary = {
    ok: 0,
    stale: 0,
    failed: 0,
    brands: []
  };

  for (const entry of statusData) {
    const st: BrandStatus = {
      brandId: entry.brandId,
      status: entry.status || 'failed',
      lastSuccess: entry.lastSuccess ? new Date(entry.lastSuccess) : null,
      lastError: entry.lastError ? new Date(entry.lastError) : null,
      consecutiveFailures: entry.consecutiveFailures || 0
    };

    summary.brands.push(st);

    if (st.status === 'ok') summary.ok++;
    else if (st.status === 'stale') summary.stale++;
    else summary.failed++;
  }

  return summary;
}
