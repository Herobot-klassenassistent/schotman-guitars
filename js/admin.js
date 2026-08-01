/* ===== Schotman Guitars — simple password editor (Netlify Blobs backend) ===== */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  let PW = sessionStorage.getItem("schotman_pw") || "";
  let shop = { guitars: [] };
  let blog = { posts: [] };

  /* ---------- tiny DOM helper ---------- */
  function el(tag, props, kids) {
    const e = document.createElement(tag);
    if (props) for (const k in props) {
      if (k === "class") e.className = props[k];
      else if (k === "html") e.innerHTML = props[k];
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), props[k]);
      else if (k in e) e[k] = props[k];
      else e.setAttribute(k, props[k]);
    }
    (Array.isArray(kids) ? kids : kids != null ? [kids] : []).forEach(
      (k) => e.appendChild(typeof k === "string" ? document.createTextNode(k) : k)
    );
    return e;
  }

  /* ---------- API ---------- */
  const loadContent = (type) =>
    fetch(`/.netlify/functions/content-get?type=${type}`)
      .then((r) => { if (!r.ok) throw 0; return r.json(); })
      .catch(() => fetch(`/content/${type}.json`).then((r) => r.json()));

  async function save(type, data) {
    const r = await fetch("/.netlify/functions/content-save", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type, data, password: PW }),
    });
    if (r.status === 401) throw new Error("unauthorized");
    if (!r.ok) throw new Error("save failed");
    return r.json();
  }

  async function uploadImage(file) {
    const dataUrl = await new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
    const r = await fetch("/.netlify/functions/media-upload", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: PW, filename: file.name, dataUrl }),
    });
    if (!r.ok) throw new Error("upload failed");
    return (await r.json()).url;
  }

  /* ---------- field schemas ---------- */
  const GUITAR_FIELDS = [
    { k: "name", label: "Naam", t: "text" },
    { k: "subtitle", label: "Ondertitel / serie", t: "text" },
    { k: "price", label: "Prijs (€)", t: "number" },
    { k: "salePrice", label: "Aanbiedingsprijs (€) — leeg = geen korting", t: "number" },
    { k: "status", label: "Status", t: "select", opts: [["in-stock", "Op voorraad"], ["sold", "Verkocht"], ["reserved", "Gereserveerd"], ["new", "Nieuw"]] },
    { k: "featured", label: "⭐ Uitgelicht (groot bovenaan shop + homepage)", t: "bool" },
    { k: "image", label: "Hoofdfoto", t: "image" },
    { k: "gallery", label: "Galerij-foto's", t: "images" },
    { k: "wood", label: "Houtsoorten (kort, voor kaartje)", t: "text" },
    { k: "hardware", label: "Hardware (kort, voor kaartje)", t: "text" },
    { k: "description", label: "Omschrijving", t: "textarea" },
    { k: "specs", label: "Specificaties", t: "kv" },
    { k: "id", label: "ID (webadres — letters/cijfers/streepjes)", t: "text" },
  ];
  const POST_FIELDS = [
    { k: "title", label: "Titel", t: "text" },
    { k: "date", label: "Datum", t: "date" },
    { k: "published", label: "Gepubliceerd", t: "bool" },
    { k: "image", label: "Hoofdfoto", t: "image" },
    { k: "excerpt", label: "Korte samenvatting", t: "textarea" },
    { k: "body", label: "Bericht (Markdown mag: **vet**, # kop, - lijst)", t: "textarea" },
    { k: "id", label: "ID (webadres)", t: "text" },
  ];

  /* ---------- field renderer ---------- */
  function field(item, f) {
    const wrap = el("label", { class: "adm-field" }, [el("span", null, f.label)]);
    if (f.t === "text" || f.t === "number" || f.t === "date") {
      wrap.appendChild(el("input", {
        type: f.t === "date" ? "date" : f.t === "number" ? "number" : "text",
        value: item[f.k] != null ? item[f.k] : "",
        oninput: (e) => { item[f.k] = f.t === "number" ? (e.target.value === "" ? undefined : +e.target.value) : e.target.value; },
      }));
    } else if (f.t === "textarea") {
      wrap.appendChild(el("textarea", { rows: f.k === "body" ? 8 : 3, value: item[f.k] || "", oninput: (e) => (item[f.k] = e.target.value) }));
    } else if (f.t === "bool") {
      const cb = el("input", { type: "checkbox", checked: !!item[f.k], onchange: (e) => (item[f.k] = e.target.checked) });
      wrap.classList.add("adm-field--row");
      wrap.appendChild(cb);
    } else if (f.t === "select") {
      const sel = el("select", { onchange: (e) => (item[f.k] = e.target.value) },
        f.opts.map(([v, l]) => el("option", { value: v, selected: item[f.k] === v }, l)));
      if (!item[f.k]) item[f.k] = f.opts[0][0];
      wrap.appendChild(sel);
    } else if (f.t === "image") {
      wrap.appendChild(imageField(item, f.k));
    } else if (f.t === "images") {
      wrap.appendChild(imagesField(item, f.k));
    } else if (f.t === "kv") {
      wrap.appendChild(kvField(item, f.k));
    }
    return wrap;
  }

  function thumb(src) { return el("img", { src: src || "", class: "adm-thumb", alt: "" }); }

  function imageField(item, k) {
    const box = el("div", { class: "adm-img" });
    const img = thumb(item[k]);
    const fileIn = el("input", { type: "file", accept: "image/*", style: "display:none",
      onchange: async (e) => {
        const f = e.target.files[0]; if (!f) return;
        btn.textContent = "Uploaden…";
        try { item[k] = await uploadImage(f); img.src = item[k]; btn.textContent = "Foto vervangen"; }
        catch { btn.textContent = "Upload mislukt — opnieuw"; }
      } });
    const btn = el("button", { type: "button", class: "adm-mini", onclick: () => fileIn.click() }, item[k] ? "Foto vervangen" : "Foto uploaden");
    box.append(img, btn, fileIn);
    return box;
  }

  function imagesField(item, k) {
    if (!Array.isArray(item[k])) item[k] = [];
    const box = el("div", { class: "adm-imgs" });
    const grid = el("div", { class: "adm-imgs__grid" });
    function redraw() {
      grid.innerHTML = "";
      item[k].forEach((src, i) => {
        const cell = el("div", { class: "adm-imgs__cell" }, [
          thumb(src),
          el("button", { type: "button", class: "adm-x", title: "Verwijder", onclick: () => { item[k].splice(i, 1); redraw(); } }, "×"),
        ]);
        grid.appendChild(cell);
      });
    }
    const fileIn = el("input", { type: "file", accept: "image/*", multiple: true, style: "display:none",
      onchange: async (e) => {
        for (const f of e.target.files) { try { item[k].push(await uploadImage(f)); redraw(); } catch {} }
      } });
    const add = el("button", { type: "button", class: "adm-mini", onclick: () => fileIn.click() }, "+ Foto's toevoegen");
    redraw();
    box.append(grid, add, fileIn);
    return box;
  }

  function kvField(item, k) {
    if (!Array.isArray(item[k])) item[k] = [];
    const box = el("div", { class: "adm-kv" });
    const rows = el("div");
    function redraw() {
      rows.innerHTML = "";
      item[k].forEach((row, i) => {
        rows.appendChild(el("div", { class: "adm-kv__row" }, [
          el("input", { placeholder: "Naam (bijv. Body)", value: row.label || "", oninput: (e) => (row.label = e.target.value) }),
          el("input", { placeholder: "Detail (bijv. Mahonie)", value: row.value || "", oninput: (e) => (row.value = e.target.value) }),
          el("button", { type: "button", class: "adm-x", onclick: () => { item[k].splice(i, 1); redraw(); } }, "×"),
        ]));
      });
    }
    const add = el("button", { type: "button", class: "adm-mini", onclick: () => { item[k].push({ label: "", value: "" }); redraw(); } }, "+ Specificatie");
    redraw();
    box.append(rows, add);
    return box;
  }

  /* ---------- item card ---------- */
  function card(item, fields, arr, i, rerender) {
    const title = item.name || item.title || "(naamloos)";
    const body = el("div", { class: "adm-card__body", hidden: true }, fields.map((f) => field(item, f)));
    const head = el("div", { class: "adm-card__head" }, [
      el("button", { type: "button", class: "adm-card__toggle", onclick: () => (body.hidden = !body.hidden) }, `▸ ${title}`),
      el("div", { class: "adm-card__ops" }, [
        el("button", { type: "button", class: "adm-mini", title: "Omhoog", onclick: () => { if (i > 0) { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; rerender(); } } }, "↑"),
        el("button", { type: "button", class: "adm-mini", title: "Omlaag", onclick: () => { if (i < arr.length - 1) { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; rerender(); } } }, "↓"),
        el("button", { type: "button", class: "adm-mini adm-mini--del", onclick: () => { if (confirm(`"${title}" verwijderen?`)) { arr.splice(i, 1); rerender(); } } }, "Verwijder"),
      ]),
    ]);
    return el("div", { class: "adm-card" }, [head, body]);
  }

  function renderGuitars() {
    const list = $("#listGuitars"); list.innerHTML = "";
    shop.guitars.forEach((g, i) => list.appendChild(card(g, GUITAR_FIELDS, shop.guitars, i, renderGuitars)));
  }
  function renderBlog() {
    const list = $("#listBlog"); list.innerHTML = "";
    blog.posts.forEach((p, i) => list.appendChild(card(p, POST_FIELDS, blog.posts, i, renderBlog)));
  }

  /* ---------- status ---------- */
  function status(msg, kind) {
    const s = $("#admStatus"); s.textContent = msg; s.className = "adm-status" + (kind ? " adm-status--" + kind : "");
    if (kind === "ok") setTimeout(() => { if (s.textContent === msg) s.textContent = ""; }, 4000);
  }

  /* ---------- boot ---------- */
  function currentTab() { return $(".adm-tab.is-active").dataset.tab; }

  async function saveAll() {
    status("Opslaan…");
    try {
      await save("shop", shop);
      await save("blog", blog);
      status("Opgeslagen! Binnen een paar seconden live op de site.", "ok");
    } catch (e) {
      if (String(e.message) === "unauthorized") { status("Verkeerd wachtwoord — log opnieuw in.", "err"); logout(); }
      else status("Opslaan mislukt. Probeer opnieuw.", "err");
    }
  }

  function logout() { PW = ""; sessionStorage.removeItem("schotman_pw"); $("#admApp").hidden = true; $("#admLogin").hidden = false; }

  async function enter() {
    const pw = $("#admPw").value.trim();
    if (!pw) return;
    PW = pw;
    $("#admErr").textContent = "Laden…";
    try {
      [shop, blog] = await Promise.all([loadContent("shop"), loadContent("blog")]);
      if (!shop.guitars) shop.guitars = [];
      if (!blog.posts) blog.posts = [];
      // verify password with a no-op save (also seeds Blobs on first run)
      await save("shop", shop);
      sessionStorage.setItem("schotman_pw", PW);
      $("#admErr").textContent = "";
      $("#admLogin").hidden = true; $("#admApp").hidden = false;
      renderGuitars(); renderBlog();
    } catch (e) {
      if (String(e.message) === "unauthorized") $("#admErr").textContent = "Verkeerd wachtwoord.";
      else $("#admErr").textContent = "Er ging iets mis. Probeer opnieuw.";
      PW = "";
    }
  }

  /* events */
  $("#admLoginBtn").addEventListener("click", enter);
  $("#admPw").addEventListener("keydown", (e) => { if (e.key === "Enter") enter(); });
  $("#admSave").addEventListener("click", saveAll);
  document.querySelectorAll(".adm-tab").forEach((t) =>
    t.addEventListener("click", () => {
      document.querySelectorAll(".adm-tab").forEach((x) => x.classList.remove("is-active"));
      t.classList.add("is-active");
      $("#paneGuitars").hidden = t.dataset.tab !== "guitars";
      $("#paneBlog").hidden = t.dataset.tab !== "blog";
    })
  );
  document.querySelectorAll(".adm-add").forEach((b) =>
    b.addEventListener("click", () => {
      if (b.dataset.add === "guitar") { shop.guitars.push({ id: "", name: "", price: 0, currency: "EUR", status: "in-stock", featured: false }); renderGuitars(); }
      else { blog.posts.push({ id: "", title: "", date: new Date().toISOString().slice(0, 10), published: true }); renderBlog(); }
      window.scrollTo(0, document.body.scrollHeight);
    })
  );

  // auto-resume if password already in session
  if (PW) { $("#admPw").value = PW; enter(); }
})();
