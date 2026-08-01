/* ===== Schotman Guitars — Digital Guitar Passport + Build Diary ===== */
(function () {
  "use strict";
  const el = document.getElementById("passport");
  if (!el) return;
  const id = new URLSearchParams(location.search).get("id");

  window.loadContent("shop").then(data => {
    const list = data.guitars || [];
    const g = list.find(x => x.id === id && x.passport) || list.find(x => x.passport) || list[0];
    if (!g) { el.innerHTML = '<div class="gp__loading">No passport found. <a href="index.html#shop">Back to the shop →</a></div>'; return; }

    const p = g.passport || {};
    document.title = `${g.name} — Guitar Passport`;
    const qr = `assets/passports/${g.id}-qr.png`;

    let specEntries = Array.isArray(g.specs) ? g.specs.map(s => [s.label, s.value])
      : (g.specs ? Object.entries(g.specs) : []);
    const specRows = specEntries.map(([k, v]) => `<div class="spec-row"><span>${k}</span><b>${v}</b></div>`).join("");

    const diary = (g.diary || []);

    el.innerHTML = `
      <a href="guitar.html?id=${encodeURIComponent(g.id)}" class="gp__back">← Back to ${g.name}</a>

      <!-- CERTIFICATE -->
      <section class="cert reveal in">
        <div class="cert__frame">
          <p class="cert__eyebrow">Certificate of Authenticity</p>
          <div class="cert__hero"><img src="${g.image}" alt="${g.name}"></div>
          <h1 class="cert__name">${g.name}</h1>
          <p class="cert__sub">${g.subtitle || ""}</p>
          <div class="cert__meta">
            <div><span>Serial</span><b>${p.serial || "—"}</b></div>
            <div><span>Build</span><b>${p.buildNo ? `No. ${p.buildNo} of ${p.totalBuilt || "—"}` : "—"}</b></div>
            <div><span>Year</span><b>${p.buildYear || "—"}</b></div>
          </div>
          ${p.builtFor ? `<p class="cert__for">Built for ${p.builtFor}</p>` : ""}
          <p class="cert__blurb">Designed, built and finished entirely by hand in the Schotman workshop — a unique, one-of-one instrument.</p>
          <div class="cert__foot">
            <div class="cert__sig">
              <span class="cert__signame">${p.signature || "Robert Schotman"}</span>
              <span class="cert__sigrole">Luthier · Heino, Netherlands</span>
            </div>
            <div class="cert__qr">
              <img src="${qr}" alt="QR code to this passport" onerror="this.style.display='none'">
              <span>Scan on the guitar</span>
            </div>
          </div>
        </div>
        <div class="cert__actions">
          ${p.pdf ? `<a class="btn btn--gold" href="${p.pdf}" download>⬇ Download PDF certificate</a>` : ""}
          <a class="btn btn--ghost" href="guitar.html?id=${encodeURIComponent(g.id)}">View all photos</a>
        </div>
      </section>

      <!-- BUILD DIARY -->
      ${diary.length ? `
      <section class="diary">
        <div class="diary__head">
          <p class="section__eyebrow reveal">The build diary</p>
          <h2 class="section__title reveal">From raw wood to one-of-one</h2>
          <p class="section__lead reveal">Every stage of this exact guitar being made by hand in Heino.</p>
        </div>
        <div class="diary__timeline">
          ${diary.map((d, i) => `
            <article class="dstep reveal">
              <div class="dstep__media"><img src="${d.image}" alt="${d.title}" loading="lazy"><span class="dstep__no">${String(i + 1).padStart(2, "0")}</span></div>
              <div class="dstep__body">
                <h3>${d.title}</h3>
                <p>${d.caption || ""}</p>
              </div>
            </article>`).join("")}
        </div>
      </section>` : ""}

      <!-- SPECS -->
      ${specRows ? `<section class="pp__specs"><h2 class="specs__title reveal">Specifications</h2><div class="specs">${specRows}</div></section>` : ""}

      <!-- TONE DNA (coming) -->
      <section class="tonedna reveal">
        <p class="section__eyebrow">Tone DNA</p>
        <h2 class="section__title">This guitar's sonic fingerprint</h2>
        <p class="section__lead">A unique waveform + frequency signature, generated from this instrument's own recording — coming once Robert captures its audio in the workshop.</p>
        <div class="tonedna__placeholder">◠◡◠◡ &nbsp; awaiting recording &nbsp; ◡◠◡◠</div>
      </section>
    `;

    // reveal newly-added nodes
    if (window.IntersectionObserver) {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
      el.querySelectorAll(".reveal:not(.in)").forEach(n => io.observe(n));
    } else {
      el.querySelectorAll(".reveal").forEach(n => n.classList.add("in"));
    }
  }).catch(err => {
    el.innerHTML = '<div class="gp__loading">Could not load this passport.</div>';
    console.warn(err);
  });
})();
