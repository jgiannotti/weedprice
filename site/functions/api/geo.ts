export async function onRequest(context: any): Promise<Response> {
  const req = context.request as Request & { cf?: any };

  const cf = (req as any).cf ?? {};
  const payload = {
    source: "cf-ip",
    city: cf.city ?? null,
    region: cf.region ?? null,
    regionCode: cf.regionCode ?? null,
    postalCode: cf.postalCode ?? null,
    timezone: cf.timezone ?? null,
    lat: typeof cf.latitude === "number" ? cf.latitude : null,
    lon: typeof cf.longitude === "number" ? cf.longitude : null
  };

  return new Response(JSON.stringify(payload), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
