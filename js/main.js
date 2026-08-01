/* ===== Schotman Guitars — interactions ===== */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* year */
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  /* nav scroll state + burger */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  const burger = $("#burger"), links = $(".nav__links");
  burger?.addEventListener("click", () => links.classList.toggle("open"));
  $$(".nav__links a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));

  /* reveal on scroll */
  const io = new IntersectionObserver((es) => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  const observeReveals = () => $$(".reveal:not(.in)").forEach(el => io.observe(el));
  observeReveals();

  /* mouse tilt (fake 3D) */
  function bindTilt(el, max = 9) {
    const target = el.querySelector("img") || el;
    let raf;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        target.style.transform =
          `rotateY(${px * max}deg) rotateX(${-py * max}deg) translateZ(20px) scale(1.03)`;
      });
    };
    const reset = () => { cancelAnimationFrame(raf); target.style.transform = ""; };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", reset);
  }
  const bindAllTilt = () => $$("[data-tilt]").forEach(el => { if (!el.__tilt) { el.__tilt = 1; bindTilt(el); } });
  bindAllTilt();

  /* hero parallax on scroll */
  const hg = $("#heroGuitar");
  if (hg) window.addEventListener("scroll", () => {
    if (window.innerWidth <= 860) { hg.style.transform = ""; return; }
    const t = Math.min(window.scrollY, 700);
    hg.style.transform = `translateY(calc(-50% + ${t * 0.12}px)) rotate(${t * 0.008}deg)`;
  }, { passive: true });

  /* ===== embers canvas ===== */
  const cv = $("#embers");
  if (cv) {
    const ctx = cv.getContext("2d");
    let W, H, parts = [];
    const resize = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight;
      parts = Array.from({ length: Math.min(46, (W * H) / 26000) }, spawn); };
    function spawn() { return { x: Math.random() * W, y: H + Math.random() * H, r: Math.random() * 1.8 + .4,
      s: Math.random() * .5 + .15, o: Math.random() * .5 + .2, d: Math.random() * .6 - .3 }; }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      parts.forEach(p => {
        p.y -= p.s; p.x += p.d;
        if (p.y < -10) Object.assign(p, spawn(), { y: H + 10 });
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7);
        ctx.fillStyle = `rgba(200,161,90,${p.o})`; ctx.fill();
      });
      requestAnimationFrame(tick);
    }
    resize(); window.addEventListener("resize", resize); tick();
  }

  /* ===== data render ===== */
  const money = (n, c = "EUR") => new Intl.NumberFormat("nl-NL", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);
  const statusLabel = { "in-stock": "In stock", sold: "Sold", reserved: "Reserved", new: "New" };
  const onSale = (g) => g.salePrice && g.salePrice > 0 && g.salePrice < g.price;
  const priceHTML = (g) => onSale(g)
    ? `<span class="price"><s>${money(g.price, g.currency)}</s> <b class="price--sale">${money(g.salePrice, g.currency)}</b></span>`
    : `<span class="price">${money(g.price, g.currency)}</span>`;
  const saleBadge = (g) => onSale(g) ? `<span class="pcard__badge badge--sale">Sale −${Math.round((1 - g.salePrice / g.price) * 100)}%</span>` : "";

  fetch("content/shop.json").then(r => r.json()).then(data => {
    const list = data.guitars || [];

    /* showcase = featured (or first 3) */
    const feat = list.filter(g => g.featured);
    const show = (feat.length ? feat : list.slice(0, 3));
    const grid = $("#showcaseGrid");
    if (grid) {
      grid.innerHTML = show.map(g => {
        const href = `guitar.html?id=${encodeURIComponent(g.id)}`;
        return `
        <article class="gcard reveal">
          <a class="gcard__stage" data-tilt href="${href}"><img src="${g.image}" alt="${g.name}"></a>
          <div class="gcard__body">
            <p class="gcard__model">${g.name}</p>
            <h3 class="gcard__name"><a href="${href}">${g.subtitle || g.name}</a></h3>
            <p class="gcard__desc">${g.description || ""}</p>
            <div class="gcard__spec">
              ${g.wood ? `<span>${g.wood}</span>` : ""}
              ${g.hardware ? `<span>${g.hardware}</span>` : ""}
            </div>
            <div class="gcard__foot">
              <span class="gcard__price">${priceHTML(g)}</span>
              <a class="btn btn--ghost" href="${href}">View details →</a>
            </div>
          </div>
        </article>`; }).join("");
    }

    /* featured hero at top of shop */
    const featWrap = $("#shopFeatured");
    const hero = feat[0];
    if (featWrap && hero) {
      const st = hero.status || "in-stock";
      const href = `guitar.html?id=${encodeURIComponent(hero.id)}`;
      featWrap.innerHTML = `
        <a class="feature reveal" href="${href}">
          <div class="feature__media" data-tilt>
            <img src="${hero.image}" alt="${hero.name}">
          </div>
          <div class="feature__body">
            <p class="feature__tag">★ Featured guitar</p>
            <h3 class="feature__name">${hero.name}</h3>
            <p class="feature__sub">${hero.subtitle || ""}</p>
            <p class="feature__desc">${hero.description || ""}</p>
            <div class="feature__foot">
              <span class="feature__price">${priceHTML(hero)}</span>
              <span class="pcard__badge badge--${st}">${statusLabel[st] || st}</span>
              ${saleBadge(hero)}
            </div>
            <span class="btn btn--gold feature__btn">View this guitar →</span>
          </div>
        </a>`;
    }

    /* shop grid = the rest (featured guitar already shown above) */
    const shop = $("#shopGrid");
    if (shop) {
      const rest = hero ? list.filter(g => g.id !== hero.id) : list;
      shop.innerHTML = rest.map(g => {
        const st = g.status || "in-stock";
        const sold = st === "sold";
        const href = `guitar.html?id=${encodeURIComponent(g.id)}`;
        return `
        <a class="pcard reveal" href="${href}">
          <div class="pcard__img">
            <span class="pcard__badge badge--${st}">${statusLabel[st] || st}</span>
            ${saleBadge(g)}
            <img src="${g.image}" alt="${g.name}">
            ${g.gallery && g.gallery.length > 1 ? `<span class="pcard__gcount">◱ ${g.gallery.length}</span>` : ""}
          </div>
          <div class="pcard__body">
            <h3 class="pcard__name">${g.name}</h3>
            <p class="pcard__sub">${g.subtitle || ""}</p>
            <p class="pcard__desc">${g.description || ""}</p>
            <div class="pcard__foot">
              <span class="pcard__price">${priceHTML(g)}</span>
              <span class="pcard__inq">${sold ? "View →" : "View details →"}</span>
            </div>
          </div>
        </a>`;
      }).join("");
    }

    /* instagram-style grid (uses guitar images as tiles until IG feed is wired) */
    const ig = $("#instaGrid");
    if (ig) {
      const tiles = list.concat(list).slice(0, 8);
      ig.innerHTML = tiles.map(g => `
        <a class="icard" href="https://www.instagram.com/schotman_guitars/" target="_blank" rel="noopener">
          <img src="${g.image}" alt="${g.name}">
          <span class="icard__ov">◱</span>
        </a>`).join("");
    }

    /* re-observe/tilt newly added nodes */
    bindAllTilt();
    observeReveals();
  }).catch(err => console.warn("shop.json not loaded:", err));

  /* prefill contact message if arriving from a guitar's "Inquire" */
  try {
    const inq = sessionStorage.getItem("schotman_inquiry");
    if (inq) {
      const msg = $("#contactMsg");
      if (msg) { msg.value = `Hi Robert, I'm interested in the ${inq}. `; }
      const sub = document.querySelector('select[name="subject"]');
      if (sub) sub.value = "A guitar from the shop";
      sessionStorage.removeItem("schotman_inquiry");
      if (location.hash === "#contact") $("#contactMsg")?.focus();
    }
  } catch (e) {}

  /* ===== youtube facade ===== */
  const film = $("#filmEmbed");
  film?.addEventListener("click", () => {
    const id = film.dataset.yt;
    film.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="Schotman Guitars film" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
  });
})();
