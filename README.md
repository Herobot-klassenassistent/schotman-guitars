# Schotman Guitars — website

A single-page, continuous-scroll site with a cinematic dark look, floating 3D-tilt
guitars, an audio A/B "hear the difference" tool, a "Design your Schotman"
configurator, an Instagram-style gallery, the Marko Tervonen film, and a shop
Robert can update from his phone.

## Run it locally
Any static server works — there is **no build step**.

```bash
python3 -m http.server 8777
```
Then open http://localhost:8777

## Project layout
```
index.html            Home (one page: hero, about, showcase, sound, film, builder, shop, IG, contact)
workshop.html         "The Workshop" — interactive build-process timeline
css/style.css         Styling (dark + gold theme)
js/main.js            Nav, scroll reveals, embers, 3D tilt, renders shop/showcase/IG
js/audio.js           A/B sound comparison (synth now, real .wav auto-detected)
js/builder.js         "Design your Schotman" dropdown configurator (data-driven)
js/workshop.js        The 9-stage build-process chart (data-driven)
content/shop.json     The guitars (edited by Robert via /admin)
admin/                Decap CMS — the phone editor
assets/guitars/       Real product photos (white background removed)
assets/uploads/       Where CMS-uploaded photos land
assets/audio/         Drop stock.wav + schotman.wav here for the real A/B demo
```

---

## Deploy to Netlify (one time)
1. Put this folder in a **GitHub repo** (Robert or you own it).
2. On Netlify: **Add new site → Import from Git → pick the repo.**
   Build command: *(empty)*, Publish directory: `.` (already set in `netlify.toml`).
3. Deploy. Netlify gives you a URL; point `schotman.com` at it under Domain settings.

### Turn on the phone editor (Decap CMS)
So Robert can add/edit/sell guitars from his phone with no code:
1. Netlify site → **Integrations / Identity → Enable Identity.**
2. Identity → **Registration = Invite only** (so only Robert can log in).
3. Identity → **Services → enable Git Gateway.**
4. Identity → **Invite users** → invite Robert's email.
5. Robert opens the invite email **on his phone**, sets a password, and is taken
   straight to the editor. Bookmark **`schotman.com/admin`** to his home screen —
   it behaves like an app.

The editor (at `/admin`) has two sections:

**🎸 Guitars** — add / edit / remove / reorder guitars. For each: name, price, an
optional **sale price** (shows a SALE −%% badge + crossed-out old price everywhere),
**status** (In stock / Sold / Reserved / New), a **⭐ Featured** toggle (shows the
guitar big at the top of the shop *and* the homepage), main photo, extra gallery
photos, description and a specs list.

**📝 Blog** — write posts (title, date, header photo, summary, and a full
rich-text/markdown body) with a **Published** toggle for drafts. New posts appear
automatically at the top of the Journal page (`blog.html`), each with its own page.

Saving anything publishes the site automatically in ~1 minute. Data lives in
`content/shop.json` and `content/blog.json`.

### Contact form
The contact form uses **Netlify Forms** (no code needed). In Netlify →
**Forms** you'll see submissions; set **Form notifications** to email them to
Robert.

---

## The audio A/B tool — adding real recordings
Right now the tool **generates** two tones in the browser so it works today:
a thin "stock" sound vs a rich, sustaining "Schotman" sound, with live waveform,
frequency spectrum and richness meters.

When Robert records the same riff on a stock guitar and on a Schotman, export two
WAV files and drop them in:
```
assets/audio/stock.wav
assets/audio/schotman.wav
```
The player detects them automatically and plays the real thing — no code change.
Tip: record both **through the same amp/mic/settings** so the only variable is the
guitar. That's the whole point.

## Guitar detail pages + gallery
Every guitar in the shop and the homepage showcase is clickable and opens
`guitar.html?id=<id>` — a full page with a **click-through gallery** (large image +
arrows + thumbnail strip + keyboard ← → + swipe on mobile), the price, status badge,
description and a real **specifications** table. The main menu stays on every page so
you can always get home. All content comes from `content/shop.json` (galleries + specs),
so adding photos/specs in the CMS flows straight through.

Photos were pulled straight from the original schotman.com product pages and kept
visually as-is, then optimised to **WebP** (1100px, quality 82). The whole
`assets/guitars/` gallery folder is ~8.5 MB for all 70 photos, and images are
lazy-loaded. The homepage hero/showcase still use the transparent "floating" PNGs.

## Guitar Passport + Build Diary (per guitar)
Any guitar with a `passport` block in `content/shop.json` gets a
`passport.html?id=<id>` page: a **Certificate of Authenticity** (serial, build
number "No. X of Y", year, built-for, Robert's signature, a **QR code**), a
**downloadable PDF certificate**, the full **build diary** (the guitar being made,
stage by stage, with real workshop photos), specs, and a "Tone DNA" slot for the
audio later. Linked from each guitar's detail page. Editable in the CMS (Guitars →
Certificate + Build diary).

The MT-COT is fully built out as the example: photos are pulled from schotman.com's
workshop gallery (it's built on the 8141 P platform, so those build shots are its
story). The PDF lives at `assets/passports/mt-cot-passport.pdf` and the QR at
`assets/passports/mt-cot-qr.png`.

**Regenerating the PDF/QR:** run `python3 /tmp/gen_passport.py` (uses reportlab +
PyMuPDF). The QR currently points to `https://schotman.com/passport.html?id=mt-cot`
— change `URL` in that script to the final domain before printing QR codes for the
physical guitars/cases.

## "Play your riff through it" (audio A/B — feature in progress)
The A/B player (`js/audio.js`) already auto-loads real recordings when present at
`assets/audio/stock.wav` / `schotman.wav`. The convolution "play your own riff
through this guitar" layer needs **impulse responses** captured at the workshop.
Drop `assets/audio/<guitar>_IR.wav` files in and they feed a Web Audio
`ConvolverNode`. Capture protocol is in the project notes / chat.

## The custom builder ("Design Yours")
Dropdown-based, organised into Schotman "chapters" (Body / Neck / Voice / Hardware /
Finish / Signature) — the logic is modelled on Halo's configurator but structured
differently so it's clearly Schotman's own. Everything is data-driven: to change
options, prices, or add categories, edit the `CONFIG` array at the top of
`js/builder.js` — nothing else needs touching. Base price is the `BASE` constant.

**Next step for the builder:** it currently previews body shape + colour only. To show
real component visuals (pickups, bridges, tops, hardware), send photos and give any
option a `thumb: "assets/uploads/xxx.png"` in `CONFIG` — a thumbnail appears next to
that dropdown automatically. We can also layer component images onto the preview later.

## The Workshop page
`workshop.html` shows the full 9-stage build journey (design → wood → CNC/shaping →
neck/fretboard → custom paint → electronics → assembly → setup → QC) as an interactive
timeline with a progress spine that fills as you scroll. To adjust it later, edit the
`PROCESS` array at the top of `js/workshop.js` (add/remove/reword stages, tags, etc.).

## Instagram feed
The gallery currently shows guitar tiles linking to
[@schotman_guitars](https://www.instagram.com/schotman_guitars/). To show live
posts, add a free feed widget (e.g. EmbedSocial / Elfsight / Behold) — paste its
embed snippet into the `#instaGrid` section, or we can wire the Instagram Basic
Display API later.

## Notes / next steps
- Guitar photos had their white studio background removed for the floating look.
- Add more guitars anytime via the editor — they appear in the shop instantly, and
  in the homepage showcase if you mark them **Featured**.
- Configurator prices are estimates; tune the numbers in `index.html`
  (`data-price` on each option) and the `BASE` value in `js/configurator.js`.
