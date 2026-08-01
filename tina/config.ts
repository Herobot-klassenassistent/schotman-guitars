import { defineConfig } from "tinacms";

// Branch to commit to (Netlify sets HEAD; falls back to main)
const branch =
  process.env.TINA_BRANCH ||
  process.env.HEAD ||
  process.env.NETLIFY_HEAD ||
  "main";

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "", // from Tina Cloud
  token: process.env.TINA_TOKEN || "",                    // from Tina Cloud
  build: {
    outputFolder: "admin", // editor served at /admin
    publicFolder: ".",     // site root (matches netlify publish ".")
  },
  media: {
    tina: {
      mediaRoot: "assets/uploads", // uploads land here, committed with the site
      publicFolder: ".",
    },
  },
  schema: {
    collections: [
      // ===================== GUITARS (content/shop.json) =====================
      {
        name: "shop",
        label: "🎸 Guitars",
        path: "content",
        format: "json",
        match: { include: "shop" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            name: "guitars",
            label: "Guitars",
            type: "object",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.name || "New guitar" }) },
            fields: [
              { name: "id", label: "ID (short, no spaces — e.g. 8141s-blue)", type: "string", required: true },
              { name: "name", label: "Name", type: "string", required: true },
              { name: "subtitle", label: "Subtitle / series", type: "string" },
              { name: "price", label: "Price (€)", type: "number", required: true },
              { name: "salePrice", label: "Sale price (€) — leave empty for no discount", type: "number" },
              { name: "currency", label: "Currency", type: "string", options: ["EUR", "USD", "GBP"] },
              {
                name: "status", label: "Status", type: "string",
                options: [
                  { value: "in-stock", label: "In stock" },
                  { value: "sold", label: "Sold" },
                  { value: "reserved", label: "Reserved" },
                  { value: "new", label: "New" },
                ],
              },
              { name: "featured", label: "⭐ Featured (big spot on shop + homepage)", type: "boolean" },
              { name: "image", label: "Main photo", type: "image" },
              { name: "gallery", label: "Gallery photos", type: "image", list: true },
              { name: "wood", label: "Woods (short, for cards)", type: "string" },
              { name: "hardware", label: "Hardware (short, for cards)", type: "string" },
              { name: "description", label: "Description", type: "string", ui: { component: "textarea" } },
              {
                name: "specs", label: "Specifications", type: "object", list: true,
                ui: { itemProps: (i) => ({ label: i?.label }) },
                fields: [
                  { name: "label", label: "Spec name", type: "string" },
                  { name: "value", label: "Detail", type: "string" },
                ],
              },
              {
                name: "passport", label: "📜 Certificate of Authenticity (optional)", type: "object",
                fields: [
                  { name: "serial", label: "Serial number", type: "string" },
                  { name: "buildYear", label: "Build year", type: "string" },
                  { name: "buildNo", label: "Build number (this one)", type: "number" },
                  { name: "totalBuilt", label: "Total built so far", type: "number" },
                  { name: "builtFor", label: "Built for (artist / owner)", type: "string" },
                  { name: "woodOrigin", label: "Wood & origin", type: "string" },
                  { name: "signature", label: "Signed by", type: "string" },
                  { name: "pdf", label: "PDF certificate path", type: "string" },
                ],
              },
              {
                name: "diary", label: "🛠️ Build diary (optional)", type: "object", list: true,
                ui: { itemProps: (i) => ({ label: i?.title }) },
                fields: [
                  { name: "image", label: "Photo", type: "image" },
                  { name: "title", label: "Step title", type: "string" },
                  { name: "caption", label: "Caption", type: "string", ui: { component: "textarea" } },
                ],
              },
            ],
          },
        ],
      },

      // ===================== BLOG (content/blog.json) =====================
      {
        name: "blog",
        label: "📝 Blog",
        path: "content",
        format: "json",
        match: { include: "blog" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            name: "posts",
            label: "Posts",
            type: "object",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.title || "New post" }) },
            fields: [
              { name: "id", label: "ID (short, no spaces)", type: "string", required: true },
              { name: "title", label: "Title", type: "string", required: true },
              { name: "date", label: "Date", type: "datetime", ui: { dateFormat: "YYYY-MM-DD" } },
              { name: "published", label: "Published", type: "boolean" },
              { name: "image", label: "Header photo", type: "image" },
              { name: "excerpt", label: "Short summary", type: "string", ui: { component: "textarea" } },
              { name: "body", label: "Post (Markdown: **bold**, # heading, - list)", type: "string", ui: { component: "textarea" } },
            ],
          },
        ],
      },
    ],
  },
});
