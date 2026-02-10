export async function onRequest(context: any): Promise<Response> {
  const kv = context.env.WEEDPRICE_KV;
  const json = await kv.get("deals:v1", { type: "text" });

  if (!json) {
    return new Response(JSON.stringify({ error: "deals_not_ready" }), {
      status: 503,
      headers: { "content-type": "application/json" }
    });
  }

  return new Response(json, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=60"
    }
  });
}
