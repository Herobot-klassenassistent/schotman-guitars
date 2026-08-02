// Returns the shop or blog content. Reads Netlify Blobs (what Robert edited);
// if nothing's there yet, falls back to the committed seed JSON.
import { getStore } from "@netlify/blobs";

export default async (req) => {
  const type = new URL(req.url).searchParams.get("type") === "blog" ? "blog" : "shop";
  // strong consistency so edits show up immediately (Blobs is eventually-consistent by default)
  const store = getStore({ name: "content", consistency: "strong" });
  let data = await store.get(type, { type: "json" });
  if (!data) {
    try {
      data = await fetch(new URL(`/content/${type}.json`, req.url)).then((r) => r.json());
    } catch {
      data = type === "blog" ? { posts: [] } : { guitars: [] };
    }
  }
  return Response.json(data, { headers: { "cache-control": "no-store" } });
};
