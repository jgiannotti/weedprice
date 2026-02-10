export async function onRequest(context: any): Promise<Response> {
  const kv = context.env.WEEDPRICE_KV;
  const json = await kv.get("status:v1", { type: "text" });

  return new Response(json ?? "{}", {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=30"
    }
  });
}
