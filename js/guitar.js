/* ===== Schotman Guitars — single guitar page + click-through gallery ===== */
(function () {
  "use strict";
  const gp = document.getElementById("gp");
  if (!gp) return;
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const eur = (n, c = "EUR") => new Intl.NumberFormat("nl-NL", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);
  const statusLabel = { "in-stock": "In stock", sold: "Sold", reserved: "Reserved", new: "New" };

  fetch("content/shop.json").then(r => r.json()).then(data => {
    const list = data.guitars || [];
    const g = list.find(x => x.id === id) || list[0];
    if (!g) { gp.innerHTML = '<div class="gp__loading">Guitar not found. <a href="index.html#shop">Back to the shop →</a></div>'; return; }

    document.title = `${g.name} — Schotman Guitars`;
    const gallery = (g.gallery && g.gallery.length) ? g.gallery : [g.image];
    const st = g.status || "in-stock";
    const onSale = g.salePrice && g.salePrice > 0 && g.salePrice < g.price;
    const priceHTML = onSale
      ? `<s>${eur(g.price, g.currency)}</s> <b class="price--sale">${eur(g.salePrice, g.currency)}</b>`
      : eur(g.price, g.currency);
    // specs may be an object {label:value} or a CMS list [{label,value}]
    let specEntries = [];
    if (Array.isArray(g.specs)) specEntries = g.specs.map(s => [s.label, s.value]);
    else if (g.specs) specEntries = Object.entries(g.specs);
    const specRows = specEntries.map(([k, v]) => `<div class="spec-row"><span>${k}</span><b>${v}</b></div>`).join("");

    gp.innerHTML = `
      <a href="index.html#shop" class="gp__back reveal in">← Back to the shop</a>
      <div class="gp__grid">
        <section class="gallery">
          <div class="gallery__stage">
            <button class="gallery__arrow gallery__arrow--prev" id="galPrev" aria-label="Previous photo">‹</button>
            <div class="gallery__imgwrap" data-tilt><img id="galMain" src="${gallery[0]}" alt="${g.name}"></div>
            <button class="gallery__arrow gallery__arrow--next" id="galNext" aria-label="Next photo">›</button>
            <span class="gallery__count"><b id="galIdx">1</b> / ${gallery.length}</span>
          </div>
          <div class="gallery__thumbs" id="galThumbs">
            ${gallery.map((src, i) => `<button class="gallery__thumb${i === 0 ? " is-active" : ""}" data-i="${i}"><img src="${src}" alt="${g.name} photo ${i + 1}" loading="lazy"></button>`).join("")}
          </div>
        </section>

        <aside class="gp__info">
          <span class="pcard__badge badge--${st} gp__badge">${statusLabel[st] || st}</span>
          ${onSale ? `<span class="pcard__badge badge--sale gp__badge" style="margin-left:.5rem">Sale −${Math.round((1 - g.salePrice / g.price) * 100)}%</span>` : ""}
          <p class="gp__model">${g.name}</p>
          <h1 class="gp__title">${g.subtitle || g.name}</h1>
          <p class="gp__price">${priceHTML}</p>
          <p class="gp__desc">${g.description || ""}</p>
          <div class="gp__actions">
            <a href="index.html#contact" class="btn btn--gold" id="gpInquire">${st === "sold" ? "Enquire about a similar build" : "Inquire about this guitar"}</a>
            <a href="index.html#design" class="btn btn--ghost">Design your own</a>
          </div>
          ${g.passport ? `<a href="passport.html?id=${encodeURIComponent(g.id)}" class="gp__passport">📜 View Certificate of Authenticity &amp; build diary →</a>` : ""}
          ${specRows ? `<div class="specs"><h2 class="specs__title">Specifications</h2>${specRows}</div>` : ""}
        </aside>
      </div>
    `;

    // ===== gallery interactions =====
    const main = document.getElementById("galMain");
    const idxEl = document.getElementById("galIdx");
    const thumbs = [...document.querySelectorAll(".gallery__thumb")];
    let cur = 0;
    function show(i) {
      cur = (i + gallery.length) % gallery.length;
      main.style.opacity = 0;
      const img = new Image();
      img.onload = () => { main.src = gallery[cur]; main.style.opacity = 1; };
      img.src = gallery[cur];
      idxEl.textContent = cur + 1;
      thumbs.forEach((t, k) => t.classList.toggle("is-active", k === cur));
      const active = thumbs[cur];
      if (active) active.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }
    document.getElementById("galPrev").addEventListener("click", () => show(cur - 1));
    document.getElementById("galNext").addEventListener("click", () => show(cur + 1));
    thumbs.forEach(t => t.addEventListener("click", () => show(+t.dataset.i)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "ArrowRight") show(cur + 1);
    });
    // swipe on touch
    let sx = null;
    const stage = document.querySelector(".gallery__stage");
    stage.addEventListener("touchstart", e => sx = e.touches[0].clientX, { passive: true });
    stage.addEventListener("touchend", e => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1));
      sx = null;
    });

    // prefill contact when inquiring
    document.getElementById("gpInquire").addEventListener("click", () => {
      try { sessionStorage.setItem("schotman_inquiry", g.name); } catch (e) {}
    });

    // re-bind tilt (main.js exposes nothing, so do a light tilt here)
    const wrap = document.querySelector(".gallery__imgwrap");
    if (wrap && window.innerWidth > 860) {
      wrap.addEventListener("mousemove", e => {
        const r = wrap.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        main.style.transform = `rotateY(${px * 8}deg) rotateX(${-py * 8}deg) scale(1.03)`;
      });
      wrap.addEventListener("mouseleave", () => main.style.transform = "");
    }
  }).catch(err => {
    gp.innerHTML = '<div class="gp__loading">Could not load this guitar. <a href="index.html#shop">Back to the shop →</a></div>';
    console.warn(err);
  });
})();
