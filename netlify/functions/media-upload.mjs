// Stores an uploaded photo in Netlify Blobs, returns a URL to serve it.
import { getStore } from "@netlify/blobs";

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  let body;
  try { body = await req.json(); } catch { return new Response("Bad request", { status: 400 }); }

  if (!process.env.ADMIN_PASSWORD || body.password !== process.env.ADMIN_PASSWORD) {
    return new Response("Unauthorized", { status: 401 });
  }
  const m = /^data:(.+?);base64,(.*)$/s.exec(body.dataUrl || "");
  if (!m) return new Response("Bad image", { status: 400 });

  const contentType = m[1];
  const bytes = Buffer.from(m[2], "base64");
  if (bytes.length > 8 * 1024 * 1024) return new Response("Image too large (max 8MB)", { status: 413 });

  const safe = (body.filename || "photo").toLowerCase().replace(/[^a-z0-9._-]/g, "_");
  const key = `${Date.now()}-${safe}`;
  const store = getStore("media");
  await store.set(key, bytes, { metadata: { contentType } });
  return Response.json({ ok: true, url: `/.netlify/functions/media?key=${encodeURIComponent(key)}` });
};
