// Serves a photo previously uploaded to Netlify Blobs.
import { getStore } from "@netlify/blobs";

export default async (req) => {
  const key = new URL(req.url).searchParams.get("key");
  if (!key) return new Response("No key", { status: 400 });
  const store = getStore("media");
  const res = await store.getWithMetadata(key, { type: "arrayBuffer" });
  if (!res) return new Response("Not found", { status: 404 });
  return new Response(res.data, {
    headers: {
      "content-type": res.metadata?.contentType || "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
};
