// Saves shop or blog content to Netlify Blobs. Requires the shared password.
import { getStore } from "@netlify/blobs";

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  let body;
  try { body = await req.json(); } catch { return new Response("Bad request", { status: 400 }); }

  if (!process.env.ADMIN_PASSWORD || body.password !== process.env.ADMIN_PASSWORD) {
    return new Response("Unauthorized", { status: 401 });
  }
  const type = body.type === "blog" ? "blog" : "shop";
  if (!body.data || typeof body.data !== "object") return new Response("No data", { status: 400 });

  const store = getStore({ name: "content", consistency: "strong" });
  await store.setJSON(type, body.data);
  return Response.json({ ok: true });
};
